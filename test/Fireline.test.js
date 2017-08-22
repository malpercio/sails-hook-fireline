const faker = require('faker');
const should = require('should');

let user, image, userGroup;

describe('DEFAULT SCOPE', function() {
  beforeEach(() => {
    user = {
      name: faker.name.firstName(),
      age: 21,
    };
    image = {
      url: "http://google.com",
    };
    userGroup = {
      name: "public",
      role: "USER",
    };
    return User.create(user)
    .then((createdUser) => {
      user = createdUser;
      return Image.create(image);
    })
    .then((createdImage) => {
      image = createdImage;
      return UserGroup.create(userGroup);
    })
    .then((createdUserGroup) => {
      userGroup = createdUserGroup;
    })
    .then(() => {
      return userGroup.addUser(user);
    })
    .then(() => {
      return User.findById(user.id);
    })
    .then((foundUser) => {
      user = foundUser;
      return user.addImage(image);
    })
    .then(() => {
      let options = {
        where: {
          id: image.id
        },
        include: [{
          model: User,
        }],
      };
      return Image.findOne(options)
    })
    .then((foundImage) => {
      image = foundImage;
    });

  });

  it('User shoud contain images', () => {
    let options = {
      where: {
        id: user.id,
      },
    };
    return User.findOne(options)
      .then((foundUser) => {
      should.exist(foundUser.images);
      let an_image = foundUser.images.shift();
      an_image.should.be.type('object');
      an_image.url.should.equal(image.url);
    });
  });

  it('UserGroup shoud contain users', () => {
    let options = {
      where: {
        id: userGroup.id
      }
    };
    return UserGroup.findOne(options)
      .then((foundUserGroup) => {
      should.exist(foundUserGroup.users);
      var one_user = foundUserGroup.users.shift();
      one_user.should.be.type('object');
      one_user.id.should.equal(user.id);
    });
  });

  it('UserGroup shoud contain users images', () => {
    let options = {
      where: {
        id: userGroup.id
      }
    };
    return UserGroup.findOne(options)
      .then((foundUserGroup) => {
      should.exist(foundUserGroup.users);
      let one_user = foundUserGroup.users.shift();
      one_user.should.be.type('object');
      one_user.id.should.equal(user.id);
      should.exist(one_user.images);
      var an_image = one_user.images.shift();
      an_image.should.be.type('object');
      an_image.url.should.equal(image.url);
    });
  });
});
