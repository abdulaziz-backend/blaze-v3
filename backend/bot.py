import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import aiohttp
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

API_TOKEN = os.getenv('BOT_API_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')
BACKEND_URL = os.getenv('BACKEND_URL')

if not API_TOKEN:
    logger.error("Bot API token is missing. Please check your .env file.")
    exit(1)

async def get_user_data(user_id):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BACKEND_URL}/get_user/{user_id}") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Failed to fetch user data. Status: {response.status}")
        except aiohttp.ClientError as e:
            logger.error(f"Network error while fetching user data: {e}")
    return None

async def update_user_data(user_data):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(f"{BACKEND_URL}/update_user", json=user_data) as response:
                if response.status != 200:
                    logger.error(f"Failed to update user data. Status: {response.status}")
                else:
                    logger.info("User data updated successfully")
        except aiohttp.ClientError as e:
            logger.error(f"Network error while updating user data: {e}")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        user_data = await get_user_data(user.id)

        if user_data is None:
            user_data = {
                "user_id": user.id,
                "username": user.username,
                "invited_frens": 0,
                "coins": 0,
                "level": "Bronze"
            }
            await update_user_data(user_data)

        coins = user_data.get('coins', 0)
        level = user_data.get('level', "Bronze")

        keyboard = [
            [
                InlineKeyboardButton("💸 Earn", web_app=WebAppInfo(url=f"{WEBAPP_URL}?user_id={user.id}")),
                InlineKeyboardButton("🗺 What?!", callback_data="what")
            ],
            [InlineKeyboardButton("🫂 Invite fren", callback_data="invite")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await update.message.reply_photo(
            photo="https://i.ibb.co/HYpxMc6/start.jpg",
            caption=f"Earn $BLAZE, Invite frens and enjoy!\n\nYour current balance: {coins} $BLAZE\nYour current level: {level}",
            reply_markup=reply_markup,
        )
    except Exception as e:
        logger.error(f"Error in start command: {e}")
        await update.message.reply_text("An error occurred. Please try again later.")

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()

    if query.data == "what":
        await query.message.reply_text(
            "Yo, welcome to the 🔥 Blaze Fam 🤘! \nWe out here hustlin’ for that crypto 💸. Pull up, invite your squad, and smash them tasks to stack up! 💰🚀 #GetThatBag"
        )
    elif query.data == "invite":
        await query.message.reply_text(
            "Share this link with your friends to invite them: https://t.me/your_bot_username"
        )

def main() -> None:
    application = Application.builder().token(API_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(button_callback))

    application.run_polling()

if __name__ == "__main__":
    main()
