const mongoose = require("mongoose");

const db = "mongodb+srv://anthentiation:2580@anthentiation.zhvg5vq.mongodb.net/Anthentiation?retryWrites=true&w=majority";

mongoose.connect(db,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=> console.log('DB Connected'))
.catch((error)=> console.log(error));