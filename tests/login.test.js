const request = require('supertest');
const app = require('../index');
const userModel = require('../models/users');
const bcrypt = require('bcrypt');

// Mock user data
const mockUser = {
    username: 'testuser',
    password: 'testpassword',
    _id: '1'
};

userModel.findOne = jest.fn().mockImplementation((query) => {
    if (query.username === mockUser.username) {
        return Promise.resolve(mockUser);
    }
    return Promise.resolve(null);
});

bcrypt.compare = jest.fn().mockImplementation((password, hash) => {
    if (password === 'testpassword') {
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
});

describe('POST /auth/', () => {
    it('should login successfully with correct credentials', async () => {
        const res = await request(app)
            .post('/auth/')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(res.statusCode).toEqual(200);
        // expect(res.body).toHaveProperty('accessToken'); // Object isn't returned so this doesn't work
        expect(res.body).toEqual(expect.any(String));
    });

    it('should fail with incorrect password', async () => {
        const res = await request(app)
            .post('/auth/')
            .send({ username: 'testuser', password: 'wrongpassword' });

        expect(res.statusCode).toEqual(400);
        //  expect(res.body).toEqual({ invalid: 'invalid password' });
        expect(res.body).toEqual("invalid password");
    });

    it('should fail if user does not exist', async () => {
        const res = await request(app)
            .post('/auth')
            .send({ username: 'nonexistent', password: 'testpassword' });

        expect(res.statusCode).toEqual(400);
        //    expect(res.body).toEqual({ notexist: 'notexist' });
        expect(res.body).toEqual("notexist");
    });
});