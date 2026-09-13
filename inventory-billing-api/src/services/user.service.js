const bcrypt = require('bcryptjs');
const supabase = require('../config/database');

const mapUser = (user, role = null) => ({
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    roleId: user.role_id,
    roleName: role?.name || '',
    isActive: user.is_active,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at
});

const getRoleById = async (roleId) => {
    if (!roleId) {
        return null;
    }

    const { data, error } = await supabase
        .from('roles')
        .select('id, name')
        .eq('id', roleId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }

        throw error;
    }

    return data;
};

const getUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            role_id,
            is_active,
            last_login_at,
            created_at,
            updated_at
        `)
        .order('full_name');

    if (error) throw error;

    const users = data || [];

    const roleIds = [
        ...new Set(
            users
                .map(user => user.role_id)
                .filter(Boolean)
        )
    ];

    let roles = [];

    if (roleIds.length > 0) {
        const { data: roleData, error: roleError } =
            await supabase
                .from('roles')
                .select('id, name')
                .in('id', roleIds);

        if (roleError) throw roleError;

        roles = roleData || [];
    }

    const roleMap = new Map(
        roles.map(role => [role.id, role])
    );

    return users.map(user =>
        mapUser(
            user,
            roleMap.get(user.role_id)
        )
    );
};

const getUserById = async (id) => {
    const { data, error } = await supabase
        .from('users')
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            role_id,
            is_active,
            last_login_at,
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

    const role = await getRoleById(
        data.role_id
    );

    return mapUser(data, role);
};

const createUser = async (userData) => {
    if (!userData.password) {
        const err = new Error(
            'Password is required when creating a user'
        );
        err.statusCode = 422;
        throw err;
    }

    const passwordHash = await bcrypt.hash(
        String(userData.password),
        10
    );

    const payload = {
        username: String(userData.username).trim(),
        full_name: String(userData.fullName).trim(),
        email: String(userData.email).trim().toLowerCase(),
        phone: userData.phone || null,
        password_hash: passwordHash,
        role_id:
            userData.roleId !== undefined &&
            userData.roleId !== null
                ? Number(userData.roleId)
                : null,
        is_active:
            userData.isActive !== undefined
                ? Boolean(userData.isActive)
                : true
    };

    const { data, error } = await supabase
        .from('users')
        .insert(payload)
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            role_id,
            is_active,
            last_login_at,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Username or email already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        if (error.code === '23503') {
            const err = new Error(
                'Invalid role'
            );
            err.statusCode = 400;
            throw err;
        }

        throw error;
    }

    const role = await getRoleById(
        data.role_id
    );

    return mapUser(data, role);
};

const updateUser = async (id, userData) => {
    await getUserById(id);

    const payload = {};

    if (userData.username !== undefined) {
        payload.username =
            String(userData.username).trim();
    }

    if (userData.fullName !== undefined) {
        payload.full_name =
            String(userData.fullName).trim();
    }

    if (userData.email !== undefined) {
        payload.email =
            String(userData.email)
                .trim()
                .toLowerCase();
    }

    if (userData.phone !== undefined) {
        payload.phone =
            userData.phone || null;
    }

    if (userData.roleId !== undefined) {
        payload.role_id =
            userData.roleId === null
                ? null
                : Number(userData.roleId);
    }

    if (userData.isActive !== undefined) {
        payload.is_active =
            Boolean(userData.isActive);
    }

    if (userData.password) {
        payload.password_hash =
            await bcrypt.hash(
                String(userData.password),
                10
            );
    }

    if (Object.keys(payload).length === 0) {
        return getUserById(id);
    }

    const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', id)
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            role_id,
            is_active,
            last_login_at,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Username or email already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        if (error.code === '23503') {
            const err = new Error(
                'Invalid role'
            );
            err.statusCode = 400;
            throw err;
        }

        throw error;
    }

    const role = await getRoleById(
        data.role_id
    );

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
            const err = new Error(
                'User cannot be deleted because it is referenced by other records'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return {
        success: true,
        id
    };
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};