import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'readline';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqnet';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    force: false,
    name: '',
    email: '',
    password: ''
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--force') {
      options.force = true;
    } else if (args[i] === '--name' && args[i + 1]) {
      options.name = args[++i];
    } else if (args[i] === '--email' && args[i + 1]) {
      options.email = args[++i];
    } else if (args[i] === '--password' && args[i + 1]) {
      options.password = args[++i];
    }
  }

  return options;
}

function promptHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (process.stdin.isTTY) {
      process.stdout.write(query);
      let password = '';
      process.stdin.setRawMode(true);
      process.stdin.resume();

      const onData = (char) => {
        const c = char.toString('utf8');
        if (c === '\n' || c === '\r' || c === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
        } else if (c === '\u0003') {
          // Ctrl+C
          process.stdin.setRawMode(false);
          process.exit(1);
        } else if (c === '\b' || c === '\x7f') {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          password += c;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function validatePassword(password) {
  if (password.length < 12) {
    return 'Password must be at least 12 characters long.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

async function main() {
  console.log('====================================================');
  console.log(' ResQNet Admin Account Provisioning CLI');
  console.log('====================================================');

  const args = parseArgs();

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);

    const existingAdminCount = await User.countDocuments({ role: 'admin' });
    if (existingAdminCount > 0 && !args.force) {
      console.error('\n[ERROR] An admin account already exists in this ResQNet database.');
      console.error('To add or update an admin account anyway, re-run with the --force flag:');
      console.error('  npm run create-admin -- --force\n');
      process.exit(1);
    }

    let name = args.name;
    let email = args.email;
    let password = args.password;

    if (!name) {
      name = await prompt('Admin Full Name [System Administrator]: ');
      if (!name) name = 'System Administrator';
    }

    if (!email) {
      while (!email) {
        email = await prompt('Admin Email: ');
        if (!email || !email.includes('@')) {
          console.log('Please enter a valid email address.');
          email = '';
        }
      }
    }

    if (!password) {
      while (!password) {
        const inputPass = await promptHidden('Enter Admin Password (min 12 chars, upper, lower, number, symbol): ');
        const passError = validatePassword(inputPass);
        if (passError) {
          console.log(`[Invalid Password] ${passError}`);
        } else {
          const confirmPass = await promptHidden('Confirm Admin Password: ');
          if (confirmPass !== inputPass) {
            console.log('[Mismatch] Passwords do not match. Please try again.');
          } else {
            password = inputPass;
          }
        }
      }
    } else {
      const passError = validatePassword(password);
      if (passError) {
        console.error(`\n[ERROR] Provided password does not meet requirements: ${passError}`);
        process.exit(1);
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      existing.name = name.trim();
      existing.password = password; // Trigger pre-save hook to hash with bcrypt 12
      existing.role = 'admin';
      existing.isActive = true;
      existing.failedLoginAttempts = 0;
      existing.lockUntil = null;
      existing.mustChangePassword = false;
      await existing.save();
      console.log(`\n[SUCCESS] Updated existing user "${normalizedEmail}" and elevated to Administrator.`);
    } else {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lockUntil: null,
        mustChangePassword: false
      });
      console.log(`\n[SUCCESS] Administrator account created successfully: "${normalizedEmail}".`);
    }

    console.log('You can now log in at http://localhost:5173 with these credentials.');
    console.log('====================================================\n');
  } catch (err) {
    console.error('[ERROR] Failed to provision admin account:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
