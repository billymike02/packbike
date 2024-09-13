import { useAuth } from "../App";
import { getAuth, signOut } from "firebase/auth";

const Profile = () => {
  const { user } = useAuth();
  const auth = getAuth(); // Initialize the Firebase auth instance

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        // Optional: redirect to a login page or show a signed-out message
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <h3>You're signed in as user: {user?.uid}</h3>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
};

export default Profile;
