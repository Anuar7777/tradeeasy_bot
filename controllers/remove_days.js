const User = require("../models/User");
const bot = require("../config/telegram");

const handleRemoveDays = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const adminUser = await User.findOne({ where: { chat_id: chatId } });

    if (!adminUser || !adminUser.isAdmin) {
      return bot.sendMessage(
        chatId,
        "У вас нет прав для выполнения этой команды."
      );
    }

    bot.sendMessage(chatId, "Введите chat_id пользователя:");

    bot.once("message", async (msg) => {
      const chatIdInput = msg.text;

      bot.sendMessage(chatId, "Введите количество дней для удаления:");

      bot.once("message", async (msg) => {
        const daysInput = msg.text;

        try {
          const user = await User.findOne({ where: { chat_id: chatIdInput } });

          if (!user) {
            return bot.sendMessage(chatId, "Пользователь не найден.");
          }

          if (user.isAdmin) {
            return bot.sendMessage(
              chatId,
              "Нельзя удалять дни подписки у администратора."
            );
          }

          user.subscriptionDaysLeft -= parseInt(daysInput, 10);
          if (user.subscriptionDaysLeft < 0) user.subscriptionDaysLeft = 0;
          await user.save();

          bot.sendMessage(
            chatId,
            `У пользователя ${user.full_name} удалено ${daysInput} дней подписки.`
          );
        } catch (error) {
          console.error("Ошибка при удалении дней:", error);
          bot.sendMessage(
            chatId,
            "Произошла ошибка при удалении дней подписки."
          );
        }
      });
    });
  } catch (error) {
    console.error("Ошибка при обработке команды /remove_days:", error);
    bot.sendMessage(chatId, "Произошла ошибка, попробуйте еще раз.");
  }
};

module.exports = handleRemoveDays;
