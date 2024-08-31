const XLSX = require("xlsx");
const bot = require("../config/telegram");
const User = require("../models/User");

const generateXlsxWithUserData = async () => {
  const users = await User.findAll({
    attributes: [
      "chat_id",
      "username",
      "full_name",
      "subscriptionDaysLeft",
      "referralLink",
      "invitedBy",
      "registrationDate",
    ],
  });

  const userData = users.map((user) => [
    user.chat_id,
    user.username,
    user.full_name,
    user.subscriptionDaysLeft,
    user.referralLink,
    user.invitedBy,
    user.registrationDate,
  ]);

  const worksheetData = [
    [
      "Chat ID",
      "Username",
      "Full Name",
      "Subscription Days Left",
      "Referral Link",
      "Invited By",
      "Registration Date",
    ],
    ...userData,
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  const fileBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  return fileBuffer;
};

const handleExportReferrals = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const requestingUser = await User.findOne({ where: { chat_id: chatId } });

    if (!requestingUser || !requestingUser.isAdmin) {
      return bot.sendMessage(chatId, "У вас нет прав для выполнения этой команды.");
    }

    const xlsxContent = await generateXlsxWithUserData();

    const fileOptions = {
      filename: "referrals.xlsx",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    await bot.sendDocument(chatId, xlsxContent, {}, fileOptions);
  } catch (error) {
    console.error("Ошибка при генерации или отправке XLSX файла:", error);
    await bot.sendMessage(chatId, "Произошла ошибка при экспорте данных.");
  }
};

module.exports = handleExportReferrals;
