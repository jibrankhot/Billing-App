const bcrypt = require('bcryptjs');

const supabase = require('../config/database');
const { generateToken } = require('../utils/jwt');

const login = async (username, password) => {
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            id,
            username,
            full_name,
            email,
            phone,
            password_hash,
            role_id,
            is_active,
            roles (
                id,
                name,
                description
            )
        `)
        .eq('username', username)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!user) {
        throw new Error('Invalid username or password');
    }

    if (!user.is_active) {
        throw new Error('User account is inactive');
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error('Invalid username or password');
    }

    const tokenPayload = {
        id: user.id,
        username: user.username,
        roleId: user.role_id,
        roleName: user.roles?.name
    };

    const token = generateToken(tokenPayload);

    await supabase
        .from('users')
        .update({
            last_login_at: new Date().toISOString()
        })
        .eq('id', user.id);

    delete user.password_hash;

    return {
        token,
        user
    };
};

const getCurrentUser = async (userId) => {
    const { data: user, error } = await supabase
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
            updated_at,
            roles (
                id,
                name,
                description
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

module.exports = {
    login,
    getCurrentUser
};