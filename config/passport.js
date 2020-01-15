const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const Profile = mongoose.model('profiles');

const dotenv = require('dotenv');
dotenv.config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWTKey;

module.exports = passport => {
    passport.serializeUser( (user, cb) => {
      cb(null, user);
    })

    passport.deserializeUser( (user, cb) => {
      cb(null, user);
    })

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload.id)
            .then(user => {
                if(user.status === 0) {
                  return done(null, false);
                }

                if(user) {
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => console.log(err));
    }));

     // PASSPORT FacebookStrategy
    passport.use(new FacebookStrategy({
      clientID: process.env.facebookClientId,
      clientSecret: process.env.facebookClientSecret,
      callbackURL: '/auth/facebook/callback'
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne( {facebookId: profile.id}, function (err, user) {
        if(user){
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          // Sign the Token
          // expires in one week
          jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
              user.token = 'Bearer ' + token
              return cb(err, user);
          });
        } else {
          var newUser = new User();
          newUser.name  = profile.displayName;
          newUser.avatar = `http://graph.facebook.com/v2.2/${profile.id}/picture`;
          newUser.facebookId = profile.id;
          newUser.save()
            .then(user => {
              const profileFields = {};
              profileFields.user = user.id;
              // Save the profile
              new Profile(profileFields).save().then(profile => {
                const payload = { id: user.id, name: user.name, avatar: user.avatar };
                // Sign the Token
                // expires in one week
                jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
                    user.token = 'Bearer ' + token
                    return cb(err, user);
                });
              });
            })
          }
      });
    }
  ))

  // PASSPORT GoogleStrategy
  passport.use(new GoogleStrategy({
      clientID: 'GOOGLE_CLIENT_ID',
      clientSecret: 'GOOGLE_CLIENT_SECRET',
      callbackURL: '/auth/google/callback',
      passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
      User.findOne( {googleId: profile.id}, function (err, user) {
        if(user){
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          // Sign the Token
          // expires in one week
          jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
              user.token = 'Bearer ' + token
              return done(err, user);
          });
        } else {
          var newUser = new User();
          newUser.name  = profile.displayName;
          newUser.avatar = profile.picture;
          newUser.googleId = profile.id;
          newUser.email = profile.email[0];
          newUser.save()
            .then(user => {
              const profileFields = {};
              profileFields.user = user.id;
              // Save the profile
              new Profile(profileFields).save().then(profile => {
                const payload = { id: user.id, name: user.name, avatar: user.avatar };
                // Sign the Token
                // expires in one week
                jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
                    user.token = 'Bearer ' + token
                    return done(err, user);
                });
              });
            })
          }
      });
    }
  ));
}
