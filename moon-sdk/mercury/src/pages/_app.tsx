import {
	EmailLoginInput,
	EmailSignupInput,
} from '@moonup/moon-api';
import { useState } from 'react';
import { useMoonSDK } from './usemoonsdk';
import Image from 'next/image'
import '../styles/mercury.css'
//import '../styles/mercury.js'

const SignupPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [signupSuccess, setSignupSuccess] = useState(false);
	const [signInSuccess, setSignInSuccess] = useState(false);
	const [authenticatedAddress, setAuthenticatedAddress] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { moon, connect, createAccount, disconnect, updateToken, initialize } =
		useMoonSDK();

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	const handleConfirmPasswordChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setConfirmPassword(event.target.value);
	};

	const OpenModalSign = () => {
		const box = document.getElementById('wrapper-signup');
		box.classList.add('active-popup');
	}

	const OpenModalLogin = () => {
		const box = document.getElementById('wrapper-login');
		box.classList.add('active-popup');
	}

	const CloseModalSign = () => {
		const box = document.getElementById('wrapper-signup');
		box.classList.remove('active-popup');
	}

	const CloseModalLogin = () => {
		const box = document.getElementById('wrapper-login');
		box.classList.remove('active-popup');
	}

	const handleInitializeAndConnect = async () => {
		try {
			setLoading(true);
			setError(null);

			// Initialize and connect to Moon
			console.log('Initializing and connecting to Moon...');
			await initialize();
			await connect();
			console.log('Connected to Moon!');
			setIsConnected(true);
		} catch (error) {
			console.error('Error during connection:', error);
			setError('Error connecting to Moon. Please try again.');
		} finally {
			setLoading(false);
		}

		// const box = document.getElementById('wrapper');
		// box.classList.add('active-popup');
	};

	const handleSignup = async () => {
		if(!isConnected){
			await handleInitializeAndConnect()
		}
		try {
			setLoading(true);
			setError(null);

			if (password !== confirmPassword) {
				setPasswordError('Passwords do not match');
			} else {
				setPasswordError('');

				// Sign up the user
				const auth = moon.getAuthSDK();
				const signupRequest: EmailSignupInput = {
					email,
					password,
				};
				console.log('Signing up...');
				const signupResponse: any = await auth.emailSignup(signupRequest);
				console.log('Signup successful:', signupResponse);

				setSignupSuccess(true);
			}
		} catch (error) {
			console.error('Error during signup:', error);
			setError('Error signing up. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleSignIn = async () => {
		if(!isConnected){
			await handleInitializeAndConnect()
		}
		try {
			setLoading(true);
			setError(null);

			// Authenticate the user and sign in
			const auth = moon.getAuthSDK();
			const loginRequest: EmailLoginInput = {
				email,
				password,
			};
			console.log('Authenticating...');
			const loginResponse: any = await auth.emailLogin(loginRequest);
			console.log('Authentication successful:', loginResponse);

			// Set tokens and email
			console.log('Updating tokens and email...');
			await updateToken(
				loginResponse.data.token,
				loginResponse.data.refreshToken
			);
			moon.MoonAccount.setEmail(email);
			moon.MoonAccount.setExpiry(loginResponse.data.expiry);
			console.log('Tokens and email updated!');

			// Perform sign-in logic with MoonSDK
			console.log('Creating account...');
			const newAccount = await createAccount();
			console.log('New Account Data:', newAccount?.data);
			console.log('Setting expiry and navigating...');
			moon.MoonAccount.setExpiry(loginResponse.data.expiry);
			setSignInSuccess(true);
			setAuthenticatedAddress(newAccount.data.data.address);
			console.log('Authenticated Address:', newAccount.data.data.address);
		} catch (error) {
			console.error('Error during sign-in:', error);
			setError('Error signing in. Please try again.');
		} finally {
			setLoading(false);
		}
	};



	const handleDisconnect = async () => {
		try {
			setLoading(true);
			setError(null);

			// Disconnect from Moon
			console.log('Disconnecting...');
			await disconnect();
			console.log('Disconnected');
			setIsConnected(false);
		} catch (error) {
			console.error('Error during disconnection:', error);
			setError('Error disconnecting from Moon. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
<div>
		<header>
        
        <a href="./mercury.html">
            <Image alt="logo" width="250" height={250} src="/media/mercury_logo.png"/>
        </a>
        <nav className="navigation">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Docs</a>
            <a href="#">Support</a>
			<button className="btnSignup-popup" onClick={OpenModalSign}>Sign Up</button>
			<button className="btnLogin-popup" onClick={OpenModalLogin}>Login</button>
			{/* {!isConnected && (
				
					
						{loading ? 'Connecting...' : 'Connect to Moon'}
					
				
			)} */}
            {/* <button className="btnLogin-popup">Login</button> */}
        </nav>

		{error && <p className="text-red-500 mt-2">{error}</p>}

    </header>


<div className="wrapper" id="wrapper-signup">
<span className="icon-close" onClick={CloseModalSign}>X</span>

<div className="form-box signup mb-6">
	<h2>Signup</h2>
	{ !signupSuccess && !signInSuccess && (
		<form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
			<div className="mb-4 input-box">
				<input
					type="email"
					placeholder="Email"
					className="w-full border p-2 rounded mb-2"
					value={email}
					onChange={handleEmailChange}
				/>
			</div>
			<div className="mb-4 input-box">
				<input
					type="password"
					placeholder="Password"
					className="w-full border p-2 rounded mb-2"
					value={password}
					onChange={handlePasswordChange}
				/>
			</div>
			<div className="mb-4 input-box">
				<input
					type="password"
					placeholder="Confirm Password"
					className={`w-full border p-2 rounded mb-2 ${
						passwordError ? 'border-red-500' : ''
					}`}
					value={confirmPassword}
					onChange={handleConfirmPasswordChange}
				/>
				{passwordError && (
					<p className="text-red-500 text-xs italic">{passwordError}</p>
				)}
			</div>
			<div className="flex justify-center">
				<button
					type="button"
					className="bg-blue-500 text-white p-2 rounded btn"
					onClick={handleSignup}
				>
					{loading ? 'Signing up...' : 'Sign up for a Moon Account'}
				</button>
				{error && <p className="text-red-500 ml-2">{error}</p>}
			</div>
		</form>
	)}

{signupSuccess && !signInSuccess && isConnected && (
<div className="mb-4 text-center">
	<p>Congratulations! Your Moon account is created.</p>
	<p>Now that you have created an account, sign in.</p>
</div>
)}

</div> 


</div> {/*  wrappre  */}



<div className="wrapper" id="wrapper-login">
<span className="icon-close" onClick={CloseModalLogin}>X</span>

<h2>Login</h2>
<div className="form-box signup mb-6">

{signInSuccess && isConnected && (
				<div className="mt-4 text-center">
					<p>Authenticated Address: {authenticatedAddress}</p>
					<button
						type="button"
						className="bg-red-500 text-white p-2 rounded mt-2"
						onClick={handleDisconnect}
					>
						{loading ? 'Disconnecting...' : 'Disconnect from Moon'}
					</button>
					{error && <p className="text-red-500 mt-2">{error}</p>}
				</div>
			)}
{!signInSuccess && (
	
<form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
						<div className="mb-4 input-box">
							<input
								type="email"
								placeholder="Email"
								className="w-full border p-2 rounded mb-2"
								value={email}
								onChange={handleEmailChange}
							/>
						</div>
						<div className="mb-4 input-box">
							<input
								type="password"
								placeholder="Password"
								className="w-full border p-2 rounded mb-2"
								value={password}
								onChange={handlePasswordChange}
							/>
						</div>
						<div className="flex justify-center">
							<button
								type="button"
								className="bg-blue-500 text-white p-2 rounded btn"
								onClick={handleSignIn}
							>
								{loading ? 'Signing in...' : 'Sign In'}
							</button>
							{error && <p className="text-red-500 ml-2">{error}</p>}
						</div>
					</form>
)}

</div>			
</div>
</div>			

		
	);
};

export default SignupPage;