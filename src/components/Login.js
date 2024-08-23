import styles from "./Login.module.css";

const Login = () => {
  return (
    <div className={styles.Base}>
      <div className={styles.Center}>
        <h1>Login to PackBike</h1>
        <input type="email" placeholder="E-Mail Address" />
        <input type="password" placeholder="Password" />
        <button>Sign In</button>
        <h3>Create an account</h3>
      </div>
    </div>
  );
};

export default Login;
