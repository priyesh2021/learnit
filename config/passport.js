const passport = require("passport");
const mongoose = require("mongoose");

const User = mongoose.model("users");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTHURL } = require("./keys");
passport.use(
  new GoogleStrategy(
    {
      clientID: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      callbackURL: OAUTHURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      };
      console.log(newUser);
      try {
        let user = await User.findOne({ email: newUser.email });
        if (user) {
          // User Exists
          console.log("EXISTS ", user);
          done(null, user);
        } else {
          // Sign Up for the first time
          user = await User.create(newUser);
          console.log("NEW ", user);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

//it is for new user to update the session with new user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//checking if user is logged in then diract move to dashboard
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
