const bcrypt = require('bcryptjs');
const supabase = require('../config/database');


const mapUser = (user, role = null) => ({
    id: user.id,
    roleId: user.role_id,
    roleName: role?.name || null,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at
});


const getRole = async (roleId) => {
    if (!roleId) {
        return null;
    }

    const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .eq('id', roleId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Role not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return data;
};


const getRoles = async () => {
    const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .order('name');

    if (error) {
        throw error;
    }

    return data || [];
};


const getUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select(`
            id,
            role_id,
            username,
            full_name,
            email,
            phone,
            is_active,
            created_at,
            updated_at
        `)
        .order('id');

    if (error) {
        throw error;
    }

    const users = data || [];

    if (users.length === 0) {
        return [];
    }

    const roleIds = [
        ...new Set(
            users
                .map(user => user.role_id)
                .filter(roleId => roleId !== null && roleId !== undefined)
        )
    ];

    let roles = [];

    if (roleIds.length > 0) {
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id, name, description')
            .in('id', roleIds);

        if (roleError) {
            throw roleError;
        }

        roles = roleData || [];
    }

    return users.map(user => {
        const role = roles.find(item => item.id === user.role_id);
        return mapUser(user, role);
    });
};


const getUserById = async (id) => {
    const { data, error } = await supabase
        .from('users')
        .select(`
            id,
            role_id,
            username,
            full_name,
            email,
            phone,
            is_active,
            created_at,
            updated_at
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    const role = await getRole(data.role_id);

    return mapUser(data, role);
};


const createUser = async (userData) => {
    const {
        username,
        password,
        fullName,
        email,
        phone,
        roleId,
        isActive = true
    } = userData;

    let role = null;

    if (roleId) {
        role = await getRole(Number(roleId));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('users')
        .insert({
            username: username.trim(),
            password_hash: passwordHash,
            full_name: fullName.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            role_id: roleId ? Number(roleId) : null,
            is_active: isActive
        })
        .select(`
            id,
            role_id,
            username,
            full_name,
            email,
            phone,
            is_active,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error('Username already exists');
            err.statusCode = 409;
            throw err;
        }

        if (error.code === '23503') {
            const err = new Error('Invalid role');
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return mapUser(data, role);
};


const updateUser = async (id, userData) => {
    const existingUser = await getUserById(id);

    const updateData = {};

    if (userData.username !== undefined) {
        updateData.username = userData.username.trim();
    }

    if (userData.fullName !== undefined) {
        updateData.full_name = userData.fullName.trim();
    }

    if (userData.email !== undefined) {
        updateData.email = userData.email?.trim() || null;
    }

    if (userData.phone !== undefined) {
        updateData.phone = userData.phone?.trim() || null;
    }

    if (userData.roleId !== undefined) {
        const role = await getRole(Number(userData.roleId));
        updateData.role_id = role.id;
    }

    if (userData.isActive !== undefined) {
        updateData.is_active = userData.isActive;
    }

    if (userData.password !== undefined) {
        updateData.password_hash = await bcrypt.hash(userData.password, 10);
    }

    if (Object.keys(updateData).length === 0) {
        return existingUser;
    }

    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select(`
            id,
            role_id,
            username,
            full_name,
            email,
            phone,
            is_active,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error('Username already exists');
            err.statusCode = 409;
            throw err;
        }

        if (error.code === '23503') {
            const err = new Error('Invalid role');
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    const role = await getRole(data.role_id);

    return mapUser(data, role);
};


const deleteUser = async (id) => {
    await getUserById(id);

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const err = new Error('User cannot be deleted because it is referenced by other records');
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return true;
};


module.exports = {
    getUsers,
    getUserById,
    getRoles,
    createUser,
    updateUser,
    deleteUser
};