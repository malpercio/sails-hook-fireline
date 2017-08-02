const faker = require('faker');
const Promise = require('bluebird');

let user, image, userGroup;

describe('ASSOCIATIONS', function() {
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

  });

  it('should add image to user',() => {
    return user.addImage(image)
    .then((addedImageUser) => {
      return Image.findById(image.id);
    })
    .then((foundImage) => {
      foundImage.owner.should.equal(user.id);
    })
  });

  it('User should contain image', () => {
    let options = {
      where: {
        id: user.id
      },
      include: [{
        model: Image,
        as: 'images',
      }],
    };
    return user.addImage(image)
      .then(() => {
        return User.findOne(options);
      })
      .then((foundUser) => {
        foundUser.should.have.property('images');
        let an_image = foundUser.images.shift();
        an_image.should.be.type('object');
        an_image.should.have.property('url', image.url);
      });
  });

  it('Image should have owner', () => {
    let options = {
      where: {
        id: image.id
      },
      include: [{
        model: User,
      }],
    };
    return user.addImage(image)
      .then(() => {
        return Image.findOne(options)
      })
      .then((foundImage) => {
        foundImage.should.have.property('User');
        foundImage.User.should.be.type('object');
        foundImage.User.should.have.property('name', user.name);
      });
  });

  it('shoud add user to user group', () => {
    return userGroup.addUser(user)
    .then((addedUserGroup) => {
      return Promise.all(
        [
          User.findById(user.id),
          addedUserGroup,
        ]
      );
    })
    .then(([foundUser,addedUserGroup]) => {
      foundUser.group.should.equal(addedUserGroup.id);
    });
  });

  it('UserGroup should contain user', () => {
    let options = {
      where: {
        id: userGroup.id
      },
      include: [
        {
          model: User,
          as: 'users'
        },
      ]
    };
    return userGroup.addUser(user)
      .then(() => {
        return UserGroup.findOne(options)
      })
      .then((userGroup) => {
        userGroup.should.have.property('users');
        var one_user = userGroup.users.shift();
        one_user.should.be.type('object');
        one_user.id.should.equal(one_user.id);
      });
  });

});
