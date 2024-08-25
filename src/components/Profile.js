import { useAuth } from "../App";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <h3>you're signed in as {user?.displayName}</h3>
    </div>
  );
};

export default Profile;
