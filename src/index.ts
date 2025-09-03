import express from 'express' //ESM語法
import { createServer } from 'http'
import { Server } from 'socket.io'
import { prisma } from './prisma'
import cors from 'cors'

import path from 'path'

const app = express();

//const port = 3000;
const port = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

//test
app.use(express.static(path.join(__dirname, '../public')));

//允許任何來源
app.use(cors());

//只有這個網址的請求才會被允許
/*
app.use(cors( {
    origin: 'https://my-chat-app-render.onrender.com'
}));

app.use(cors( {
    origin: [
        'https://my-chat-app-render.onrender.com',
        'http://localhost:3000',
        'http://localhost:5000'
    ]
}));
*/

// JSON body parser
app.use(express.json());



//建立訊息
app.post('/messages', async (req, res) => {
    const { username, content } = req.body; // <-- 這裡期待 username + content
    //console.log('start...');
    if (typeof username !== 'string' || typeof content !== 'string'){
    //if (!author || !content)
        return res.status(400).json({
            error: 'username and content must be strings'
        });
    }
    const newMessage = await prisma.message.create({
        data: {username, content},   // <-- 存進 DB,需要和 model Message一致
    })    

    // 新訊息送出後,透過socket廣播
    io.emit('new-message', newMessage);

    res.status(201).json(newMessage); //201是create狀態碼
});

//取得所有訊息
app.get('/messages', async (req, res) => {
    const messages = await prisma.message.findMany({
        orderBy: {createdAt: 'asc'}, //asc升冪,舊的在前,新的在後, desc降冪
    });
    res.json(messages);
});

// webSocket: 當用戶連線
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user discnnected');
    });
});

//啟動伺服器
httpServer.listen(port, () => {
    //程式碼寫的是 單引號 ' '，而不是 反引號 `，所以 JavaScript 不會做字串插值，${port} 只是普通字串
    //console.log('Server is running on http://localhost:${port}');
    if (process.env.RENDER)
    {
        console.log(`Server is running on Render at port ${port}`);
    
    } else {
        console.log(`Server is running on http://localhost:${port}`);
    }
});