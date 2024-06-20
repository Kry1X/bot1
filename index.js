const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '7225256073:AAGXFZat358rY8H0c4ziw8Whzt_2pTsUnTc'
const bot = new TelegramApi(token, {polling: true})

const chats = {}

// TODO: БД не создан, сервер не создан

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, '0 - 9')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Number?', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log(e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'START'},
        {command: '/info', description: 'GET INFO ABOUT USER'},
        {command: '/game', description: 'GAME'}
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try{
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://sl.combot.org/adomgames/webp/12xf09f9886.webp')
                return bot.sendMessage(chatId, 'Hello, world!')
            }
            if (text === '/info') {
                const  user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `You name: ${msg.from.username}; You id: ${msg.from.id}; You have: ${user.right} right answers`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, 'ERROR: afw#218Nw%uy%42189%##1!')
        } catch(e) {
            return bot.sendMessage(chatId, 'Error!');
        }
        
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
           return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            user.right += 1
            await bot.sendMessage(chatId, `YOU WIN!!!`, againOptions)
        } else {
            user.wrong += 1
            await bot.sendMessage(chatId, `No this number, ${chats[chatId]}`, againOptions)
        }
        await user.save();
    })
}

start()