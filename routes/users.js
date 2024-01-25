const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(409)
				.send({ message: "User with given email already Exist!" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		await new User({ ...req.body, password: hashPassword }).save();
		res.status(201).send({ message: "User created successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

router.post("/login", async (req, res) => {
	try {
	  const { error } = validate(req.body);
	  if (error)
		return res.status(400).send({ message: error.message });
  
	  const user = await User.findOne({ email: req.body.email });
	  if (!user)
		return res.status(401).send({ message: "Invalid Email" });
  
	  const validPassword = await bcrypt.compare(
		req.body.password,
		user.password
	  );
	  if (!validPassword)
		return res.status(401).send({ message: "Invalid Password" });
  
	  const token = user.generateAuthToken();
	  res.status(200).send({ data: token, message: "logged in successfully" });
	} catch (error) {
	  res.status(500).send({ message: "Internal Server Error" });
	}
  });

router.post("/info", async (req,res) => {
	const { token } = req.query;
    try {
        if(!token){
            return res.status(404).json({ message: 'No token given' });
        }

        const decodedToken = jwt.verify(token, key);
    
        const user = await User.findById(decodedToken.user._id);
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const { password, ...userWithoutPassword } = user.toObject();
    
        res.status(200).json({ user: userWithoutPassword });
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
        }
    
        console.log('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
});

module.exports = router;