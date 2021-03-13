import "./App.css";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebase.config";
import { useState } from "react";
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [user, setUser] = useState({
    isSignedIn: false,
    name: "",
    password: "",
    email: "",
    photoURL: "",
    successful: false,
  });
  const provider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(provider)
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
    if (user.email && user.password) {
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
    e.preventDefault();
  };

  return (
    <div className="App">
      {user.isSignedIn ? (
        <button onClick={handleSignOut}>Sign out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
      {user.isSignedIn && (
        <div>
          {" "}
          <p>welcome, {user.name}</p>
          <p>{user.email}</p> <img src={user.photoURL} alt="" /> <p></p>
        </div>
      )}
      <h1>Our Own Authentication</h1>

      <form onSubmit={handleSubmit}>
        <input
          onBlur={handleBlur}
          type="text"
          name="name"
          placeholder="Your Name"
        />{" "}
        <br />
        <input
          type="text"
          name="email"
          onBlur={handleBlur}
          placeholder="Enter your email"
          required
        />
        <br />
        <input
          type="password"
          name="password"
          onBlur={handleBlur}
          placeholder="Enter your Password"
          required
        />
        <br />
        <input type="submit" value="submit" />
      </form>
      <p style={{ color: "red" }}>{user.error}</p>
      {user.successful && (
        <p style={{ color: "green" }}>User Created Successfully</p>
      )}
    </div>
  );
}

export default App;
