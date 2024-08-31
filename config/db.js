require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,
  }
);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Соединение с базой данных установлено успешно.");

    await sequelize.sync(); 
    console.log("База данных синхронизирована.");
  } catch (err) {
    console.error("Ошибка при соединении с базой данных:", err);
  }
};

connectToDatabase();

module.exports = sequelize;
