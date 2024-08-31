const cron = require("node-cron");
const UserModel = require("../models/User");
const bot = require("../config/telegram");

cron.schedule("59 2 * * *", async () => {
  try {
    const users = await UserModel.findAll({
      where: {
        isAdmin: false,
      },
    });

    for (const user of users) {
      if (user.subscriptionDaysLeft > 0) {
        user.subscriptionDaysLeft -= 1;
        await user.save();
      }
      if (user.subscriptionDaysLeft === 0) {
        bot.sendMessage(
          user.chat_id,
          "Ваша подписка истекла. Пожалуйста, продлите её, чтобы продолжать получать торговые сигналы."
        );
      }
    }
  } catch (error) {
    console.error("Произошла ошибка при обновлении подписок:", error);
  }
});

cron.schedule("59 21 * * *", async () => {
  try {
    const users = await UserModel.findAll({
      where: {
        subscriptionDaysLeft: 1,
        isAdmin: false,
      },
    });

    for (const user of users) {
      bot.sendMessage(
        user.chat_id,
        "У вас остался последний день подписки. Не забудьте продлить её, чтобы продолжать получать торговые сигналы."
      );
    }
  } catch (error) {
    console.error("Произошла ошибка при отправке уведомлений:", error);
  }
});

module.exports = {};
