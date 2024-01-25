const { User, validate } = require('./user');

const createUser = async (req, res) => {
  try {
    const validationResult = await validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }

    const { firstName, lastName, email, password } = validationResult.value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createUser, getUserById };
