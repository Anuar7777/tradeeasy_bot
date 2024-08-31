const bot = require("./config/telegram");
const handleExportReferrals = require("./controllers/export_referrals");
const handleAddDays = require("./controllers/add_days");
const handleRemoveDays = require("./controllers/remove_days");
const handleInfoCommand = require("./controllers/info");
const handleStartCommand = require("./controllers/start");
const handleSignalBroadcast = require("./controllers/toggle_signals");
const handleHelpCommand = require("./controllers/help");

const UserModel = require("./models/User");

require("./controllers/subscriptionManager");

bot.onText(/\/export_referrals/, handleExportReferrals);
bot.onText(/\/help/, handleHelpCommand);
bot.onText(/\/info/, handleInfoCommand);
bot.onText(/\/toggle_signals/, handleSignalBroadcast);
bot.onText(/\/add_days/, handleAddDays);
bot.onText(/\/remove_days/, handleRemoveDays);
bot.onText(/\/start/, handleStartCommand);

bot.on("message", async (msg) => {
  const text = msg.text;
  const chat_id = msg.from.id;
  const user = await UserModel.findOne({
    where: { chat_id: chat_id },
  });

  if (text === "/status" && !user.isAdmin) {
    bot.sendMessage(
      chat_id,
      `Количество оставшихся дней подписки: ${user.subscriptionDaysLeft}.`
    );
  }

  if (text === "/invite" && !user.isAdmin) {
    bot.sendMessage(
      chat_id,
      `Вот твоя реферальная ссылка: ${user.referralLink}`
    );
  }
});
