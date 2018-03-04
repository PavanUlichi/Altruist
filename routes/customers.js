
/*
 * GET users listing.
 */
 const request = require('request');

 const options = {
     url: 'https://www.reddit.com/r/funny.json',
     method: 'GET',
     headers: {
         'Accept': 'application/json',
         'Accept-Charset': 'utf-8',
         'User-Agent': 'my-reddit-client'
     }
 };


 var FCM = require('fcm-node');
 var serverKey = 'AAAA63_6gdk:APA91bEmILLjrA11nkcNKpvD2umCOg-5p1KebB_tNSQOEtRvIfwJ6DjTRc9QSNfzQFYVakKxo2H-LkbkMOk725tE_3rK4kC0Z2LtTDZkRlvIu7p_fOL6Ro00gzUih4q6YJF8I8b427nq'; //put your server key here
 var fcm = new FCM(serverKey);


exports.list = function(req, res){

  req.getConnection(function(err,connection){

        var query = connection.query('SELECT * FROM customer',function(err,rows)
        {

            if(err)
                console.log("Error Selecting : %s ",err );

            res.render('customers',{page_title:"Customers - Node.js",data:rows});


         });

         //console.log(query.sql);
    });

};

exports.add = function(req, res){
  res.render('add_customer',{page_title:"Add Customers - Node.js"});
};

exports.edit = function(req, res){

    var id = req.params.id;

    req.getConnection(function(err,connection){

        var query = connection.query('SELECT * FROM customer WHERE id = ?',[id],function(err,rows)
        {

            if(err)
                console.log("Error Selecting : %s ",err );

            res.render('edit_customer',{page_title:"Edit Customers - Node.js",data:rows});


         });

         //console.log(query.sql);
    });
};

/*Save the customer*/
exports.save = function(req,res){

    var input = JSON.parse(JSON.stringify(req.body));

    req.getConnection(function (err, connection) {

        var data = {

            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone

        };

        var query = connection.query("INSERT INTO customer set ? ",data, function(err, rows)
        {

          if (err)
              console.log("Error inserting : %s ",err );

          res.status(200).json({message:'/customers'});

        });

       // console.log(query.sql); get raw query

    });
};


exports.register = function(req,res){

   var input = JSON.parse(JSON.stringify(req.body));

   req.getConnection(function (err, connection) {

       var data = {

           name    : input.name,
           uid: input.token,
           contact : input.contact,
           address   : input.address

       };

       var query = connection.query("INSERT INTO register set ? ",data, function(err, rows)
       {

         if (err){
             console.log("Error Registering : %s ",err );
           }
           else {
                 var query = connection.query("SELECT id FROM register where name = ?",input.name, function(err, rows){
                   if(err){
                     console.log("Error Registering : %s ",err );
                     res.status(500).send('not ok');
                   }
                   else {
                     console.log(rows[0].id);
                     res.status(200).json({'message': rows[0].id});
                   }

                 });
           }

         });

        // console.log(query.sql); get raw query

     });
  };
/*Save the customer*/
exports.transaction = function(req,res){

    var input = JSON.parse(JSON.stringify(req.body));
    var fields= JSON.stringify(input.selectedFields);
    req.getConnection(function (err, connection) {

        var data = {
            uid    : input.uid,
            type: input.type,
            selectedFields: fields,
            latitude: input.latitude,
            longitude: input.longitude
        };
        if (input.type =="donor") {
          var query = connection.query("INSERT INTO transactionTable set ? ",data, function(err, rows)
          {

            if (err){
                console.log("Error inserting : %s ",err );
                res.status(500).send("not ok")
              }
            else {

                res.status(200).json({message:'/transaction'});
            }

          });
        }
        else {
          var query=connection.query(('SELECT uid, type, (3959 * acos(cos(radians(' + input.latitude + ')) *  cos(radians(latitude)) *  cos(radians(longitude) -  radians(' + input.longitude + ')) +  sin(radians( ' + input.latitude + ')) *  sin(radians(latitude )))) AS distance FROM transactionTable HAVING distance < 25 AND type = "donor" ORDER BY distance LIMIT 0, 20;'),data, function(err, rows){
            if (err) {
              console.log(err);
              res.status(200).send("not ok");
            }
            else {
              rows.forEach(function(entry){

                              var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                  to: entry.id,

                                  notification: {
                                      title: 'Title of your push notification',
                                      body: 'Body of your push notification'
                                  },

                                  data: {  //you can send only notification or only data(or include both)
                                      my_key: 'my value',
                                      my_another_key: 'my another value'
                                  }
                              };

                              fcm.send(message, function(err, response){
                                  if (err) {
                                      console.log("Something has gone wrong!" +err);
                                  } else {
                                      console.log("Successfully sent with response: ", response);
                                  }
                              });
                            });
}

       // console.log(query.sql); get raw query

    });

}
});
}

exports.save_edit = function(req,res){

    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;

    req.getConnection(function (err, connection) {

        var data = {

            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone

        };

        connection.query("UPDATE customer set ? WHERE id = ? ",[data,id], function(err, rows)
        {

          if (err)
              console.log("Error Updating : %s ",err );

          res.redirect('/customers');

        });

    });
};


exports.delete_customer = function(req,res){

     var id = req.params.id;

     req.getConnection(function (err, connection) {

        connection.query("DELETE FROM customer  WHERE id = ? ",[id], function(err, rows)
        {

             if(err)
                 console.log("Error deleting : %s ",err );

             res.redirect('/customers');

        });

     });
};
