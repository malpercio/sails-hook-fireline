const faker = require('faker');
const should = require('should');

let user = {
  name: faker.name.firstName(),
  age: 21,
},
image = {
  url: "http://google.com",
},
userGroup = {
  name: "public",
  role: "USER",
};

describe('MODELS', () => {
  describe('User model', () => {
    it('should create user instance', () => {
      return User.create(user)
        .then((createdUser) => {
          createdUser.should.be.type('object');
          createdUser.should.have.property('name', user.name);
          createdUser.should.have.property('id');
        });
    });
  });

  describe('Image model', () => {
    it('should create image instance', () => {
      return Image.create(image)
        .then((createdImage) => {
        createdImage.should.be.type('object');
        createdImage.should.have.property('url', image.url);
        createdImage.should.have.property('id');
      });
    });
  });

  describe('UserGroup model', () => {
    it('should create user group instance', () => {
      return UserGroup.create(userGroup)
        .then((createdUserGroup) => {
        createdUserGroup.should.be.type('object');
        createdUserGroup.should.have.property('name', userGroup.name);
        createdUserGroup.should.have.property('id');
      });
    });
  });

});
