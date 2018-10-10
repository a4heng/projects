const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//connect to mongo
mongo.connect('mongodb://127.0.0.1/Lets-Chat', function(err,client){
    if(err){
        throw err;
    }
    console.log('Connected to Lets Chat');

    //connect to socket.io
    client.on('connection',function(socket){
        console.log('online');
        let chat = client.db.collection('chats');

        // Create function to send status 
        sendStatus = function(s){
            socket.emit('status',s);
        }
        //get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
            if(err){
                throw err;
            }
            //emit the messages
            socket.emit('output',res);
        });
        //Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            //check for name and message
            if(name == '' || message == ''){
                //send error message
                sendStatus('Please enter a name and a message');
            }else{
                //insert message into database
                chat.insert({name: name, message: message}, function(){
                    client.emit('output',[data]);
                    console.log(data)
                    //send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });
        socket.on('clear', function(data){
            //Remove all chat log from the collection
            chat.remove({},function(){
                //Emit cleared
                socket.emit('Chat Cleared');
            });
        });
    });
});