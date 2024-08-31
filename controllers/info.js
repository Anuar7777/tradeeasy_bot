const { Op } = require("sequelize");
const User = require("../models/User");
const bot = require("../config/telegram");

const handleInfoCommand = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const requestingUser = await User.findOne({ where: { chat_id: chatId } });

    if (!requestingUser || !requestingUser.isAdmin) {
      return bot.sendMessage(chatId, "У вас нет прав для выполнения этой команды.");
    }

    const totalUsers = await User.count({
      where: {
        isAdmin: false,
      },
    });

    const activeUsers = await User.count({
      where: { subscriptionDaysLeft: { [Op.gt]: 0 }, isAdmin: false },
    });

    const admins = await User.findAll({
      where: { isAdmin: true },
      attributes: ["username", "full_name"],
    });

    const topUsers = await User.findAll({
      where: { isAdmin: false },
      order: [["subscriptionDaysLeft", "DESC"]],
      limit: 10,
      attributes: ["username", "full_name", "subscriptionDaysLeft"],
    });

    let responseMessage = `Общая информация о системе:\n\n`;
    responseMessage += `Всего зарегистрированных пользователей: ${totalUsers}\n`;
    responseMessage += `Активных пользователей: ${activeUsers}\n\n`;

    responseMessage += `Таблица администраторов:\n`;
    admins.forEach((admin, index) => {
      responseMessage += `${index + 1}. ${admin.full_name} (@${admin.username})\n`;
    });

    responseMessage += `\nТоп 10 пользователей с наибольшим количеством оставшихся дней подписки:\n`;
    topUsers.forEach((user, index) => {
      responseMessage += `${index + 1}. ${user.full_name} (@${user.username}): ${user.subscriptionDaysLeft} дней\n`;
    });

    await bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error("Ошибка при выполнении команды /info:", error);
    await bot.sendMessage(chatId, "Произошла ошибка при получении информации.");
  }
};

module.exports = handleInfoCommand;
