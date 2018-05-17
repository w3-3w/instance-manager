module.exports = {
  config: {
    region: 'ap-northeast-1'
  },
  EC2: function() {
    this.describeInstances = () => {
      return {
        promise: () => {
          return new Promise((resolve, reject) => {
            resolve({
              Reservations: []
            });
          });
        }
      };
    };
    
  }
};
