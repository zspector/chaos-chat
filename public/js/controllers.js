app.controller('AppCtrl', ['$scope', 'socket', function($scope, socket) {

  $scope.messages = [];
  $scope.users = [];

  // Socket listeners
  socket.on('init', function (data) {
    console.log(data)
    $scope.name = data.name;
    console.log(data.users)
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    console.log("is change:name working?")
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined'
    });
    $scope.users.push(data.name);
    console.log("scope.users: ", $scope.users)
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });

  // Private helpers

  var changeName = function (oldName, newName) {
    // rename user in list of users
    console.log('step 2 controller.js')
    console.log('$scope.users in changName:', $scope.users);
    console.log("oldName in changName:", oldName);
    console.log("newNmae in changName:", newName);
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] == oldName) {
        $scope.users[i] = newName;
      }
      console.log("i'm in a for loop!",$scope.users)
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // Methods published to the scope

  $scope.requestChangeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        console.log("controller:75 changeName $scope.name:",$scope.name);
        console.log("controller:76 changeName $scope.newName:",$scope.newName);
        console.log("controller:77 changeName $scope.user:",$scope.users);
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.sendMessage = function () {
    var id = Math.round(Math.random() * 10000000 / 100)
    socket.emit('send:message', {
      message: $scope.message,
      id: id
    });

    // add the message to our model locally
    $scope.messages.push({
      id: id,
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };
}]);
