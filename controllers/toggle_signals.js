const { Op } = require("sequelize");
const bot = require("../config/telegram");
const User = require("../models/User");

let signalsEnabled = false;
let awaitingMessage = false;
let pendingSignalMessage = "";

const handleSignalBroadcast = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const requestingUser = await User.findOne({ where: { chat_id: chatId } });

    if (!requestingUser || !requestingUser.isAdmin) {
      return bot.sendMessage(
        chatId,
        "У вас нет прав для выполнения этой команды."
      );
    }

    signalsEnabled = !signalsEnabled;
    const status = signalsEnabled ? "включен" : "выключен";
    await bot.sendMessage(chatId, `Режим передачи сигналов ${status}.`);
    if (signalsEnabled) {
      awaitingMessage = true;
      await bot.sendMessage(
        chatId,
        "Отправьте сообщение, которое хотите передать всем пользователям с активной подпиской."
      );
    } else {
      awaitingMessage = false;
    }
  } catch (error) {
    console.error("Ошибка при выполнении команды /toggle_signals:", error);
    await bot.sendMessage(chatId, "Произошла ошибка при обработке команды.");
  }
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const signalMessage = msg.text;

  if (
    awaitingMessage &&
    signalMessage !== "/toggle_signals" &&
    signalsEnabled
  ) {
    pendingSignalMessage = signalMessage;

    await bot.sendMessage(chatId, "Отправить данное сообщение?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Да", callback_data: "send_signal" },
            { text: "Нет", callback_data: "cancel_signal" },
          ],
        ],
      },
    });
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const action = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (action === "send_signal" && pendingSignalMessage) {
    const activeUsers = await User.findAll({
      where: { subscriptionDaysLeft: { [Op.gt]: 0 } },
    });

    await Promise.all(
      activeUsers.map((user) =>
        bot.sendMessage(user.chat_id, pendingSignalMessage)
      )
    );

    await bot.sendMessage(
      chatId,
      "Сообщение передано всем пользователям с активной подпиской."
    );

    pendingSignalMessage = "";
  } else if (action === "cancel_signal") {
    await bot.sendMessage(chatId, "Сообщение отменено.");
    pendingSignalMessage = "";
  }

  await bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    {
      chat_id: chatId,
      message_id: callbackQuery.message.message_id,
    }
  );
});

module.exports = handleSignalBroadcast;
