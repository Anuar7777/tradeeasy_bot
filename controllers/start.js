const UserModel = require("../models/User");
const bot = require("../config/telegram");

const handleStartCommand = async (msg) => {
  const text = msg.text;
  const chat_id = msg.from.id;

  try {
    let user = await UserModel.findOne({
      where: { chat_id: chat_id },
    });

    const referrerId = text.split(" ")[1];

    if (!user) {
      user = await UserModel.create({
        chat_id: chat_id,
        username: msg.from.username || null,
        full_name: `${msg.from.first_name || ""} ${
          msg.from.last_name || ""
        }`.trim(),
        referralLink: `https://t.me/Trader_KZBot?start=${chat_id}`,
        invitedBy: referrerId || null,
        registration_date: new Date(),
      });

      const welcomeMessage = `
    Приветствую, ${user.full_name}!

Вы успешно зарегистрированы в нашем боте TradeEasyBot.

Вот краткое описание:
- Сигналы торговли: Получайте актуальные торговые сигналы для успешных сделок.
- Реферальная программа: Пригласите друзей и получите продление подписки.
- Поддержка и помощь: Воспользуйтесь командой /help для получения помощи и информации.

Пожалуйста, используйте команду /help для получения полного списка команд и их описания.
      `;

      bot.sendMessage(chat_id, welcomeMessage, { parse_mode: "HTML" });

      if (referrerId) {
        const referrer = await UserModel.findOne({
          where: { chat_id: referrerId },
        });

        if (referrer) {
          referrer.subscriptionDaysLeft += 7;
          await referrer.save();

          bot.sendMessage(
            referrerId,
            "Вам добавлено 7 дней подписки за приглашенного пользователя!"
          );
        }
      }
    } else {
      bot.sendMessage(
        chat_id,
        "Вы уже зарегистрированы. Если вы хотите обновить свои данные, используйте соответствующие команды или обратитесь за помощью командой /help."
      );
    }

    if (user.isAdmin) {
      bot.setMyCommands([
        { command: "/start", description: "Перезапуск бота" },
        { command: "/info", description: "Информация о системе" },
        { command: "/toggle_signals", description: "Управление сигналами" },
        { command: "/export_referrals", description: "Экспорт данных" },
        { command: "/add_days", description: "Добавить дни подписки" },
        { command: "/remove_days", description: "Удалить дни подписки" },
        { command: "/help", description: "Справка по командам" },
      ]);

      bot.sendMessage(chat_id, "Вы вошли как администратор.");
    } else {
      bot.setMyCommands([
        { command: "/start", description: "Перезапуск бота" },
        { command: "/status", description: "Статус подписки" },
        { command: "/invite", description: "Реферальная ссылка" },
        { command: "/help", description: "Справка по командам" },
      ]);

      bot.sendMessage(chat_id, "Добро пожаловать!");
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    bot.sendMessage(chat_id, "Произошла ошибка, попробуйте еще раз.");
  }
};

module.exports = handleStartCommand;
