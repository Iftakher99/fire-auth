import "./App.css";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebase.config";
import { useState } from "react";
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: "",
    password: "",
    email: "",
    photoURL: "",
    successful: false,
  });
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const accessToken = credential.accessToken;
        console.log(user, accessToken);

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(errorCode, errorMessage, email, credential);

        // ...
      });
  };
  const handleSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(googleProvider)
      .then((res) => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          photoURL: photoURL,
          email: email,
        };
        setUser(signedInUser);
        console.log(displayName, photoURL, email);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.message);
      });
  };
  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        const signedOutUser = {
          isSignedIn: false,
          name: "",
          photoURL: "",
          email: "",
          newUser: false,
        };
        setUser(signedOutUser);
        // Sign-out successful.
      })
      .catch((err) => {
        // An error happened.
      });
  };
  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === "password") {
      const isPasswordValid = e.target.value.length > 6;
      const isPasswordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && isPasswordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  };
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.successful = true;
          setUser(newUserInfo);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.successful = false;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.successful = true;
          setUser(newUserInfo);
          // ...
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.successful = false;
          setUser(newUserInfo);
          upDateUserName(user.name);
        });
    }
    const upDateUserName = (name) => {
      const user = firebase.auth().currentUser;

      user
        .updateProfile({
          displayName: name,
        })
        .then(function () {
          // Update successful.
        })
        .catch(function (error) {
          // An error happened.
        });
    };

    e.preventDefault();
  };

  return (
    <div className='App'>
      {user.isSignedIn ? (
        <button onClick={handleSignOut}>Sign out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
      <br />
      <button onClick={handleFbSignIn}> Sign in using fb</button>
      {user.isSignedIn && (
        <div>
          {" "}
          <p>welcome, {user.name}</p>
          <p>{user.email}</p> <img src={user.photoURL} alt='' /> <p></p>
        </div>
      )}

      <h1>Our Own Authentication</h1>
      <input
        type='checkbox'
        name='newUser'
        onChange={() => setNewUser(!newUser)}
        id=''
      />
      <label htmlFor='newUser'>Sign up</label>
      <form onSubmit={handleSubmit}>
        {newUser && (
          <input
            onBlur={handleBlur}
            type='text'
            name='name'
            placeholder='Your Name'
          />
        )}
        <br />
        <input
          type='text'
          name='email'
          onBlur={handleBlur}
          placeholder='Enter your email'
          required
        />
        <br />
        <input
          type='password'
          name='password'
          onBlur={handleBlur}
          placeholder='Enter your Password'
          required
        />
        <br />
        <input type='submit' value={newUser ? "Sign Up" : "Sign in"} />
      </form>
      <p style={{ color: "red" }}>{user.error}</p>
      {user.successful && (
        <p style={{ color: "green" }}>
          User {newUser ? "Created" : "logged In"} Successfully
        </p>
      )}
    </div>
  );
}

export default App;
