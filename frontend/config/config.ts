const configMap = {
  dbConnection: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
};

export default configMap;
