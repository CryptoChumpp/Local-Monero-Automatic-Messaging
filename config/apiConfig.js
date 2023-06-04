module.exports = {
    apiKey: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDaGltYnVzc3NzIiwiY3JlYXRlZCI6MTY2MzY1NTI3NTI2MSwiYXBpIjoicHVibGljIiwiZXhwIjoxODIxNDQzMjc1LCJqdGkiOiI1ZjJlMmI3NC1mZmExLTRhODgtOWY1ZS00NmUwZGYwYWUyMTYifQ.F3U70uP_MVcbamJ3ovR4fdwPAwFXlpyuJ-IYhWtF4PUhF7Nu9KbZHoxfxCeFfM9hKB1pY6YdWXnitlO_n7VTrg',
    endpoint: '',
    minimumTrades: 0,
    minimumFeedback: 0,
    verifiedBuyerMessages: {
      cashapp: {
        state: {
          created: "Hey, could you send your cashapp balance please?",
          funded: "Going to check the payment right now. Thank you!",
          cancelled: "Hope to see you soon!",
          released: "Thank you for trading with me today! Hope to see you again and please leave a review!"
        }
      }
    },
    unverifiedBuyerMessages: {
      cashapp: {
        state: {
          created: "Hey, could you send your cashapp balance please?",
          funded: "Going to check the payment right now. Thank you!",
          cancelled: "Hope to see you soon!",
          released: "Thank you for trading with me today! Hope to see you again and please leave a review!"
        }
      }
    },
    sendScreenshot: true,
    screenshotPath: {
      cashapp: {
        state: {
          funded: '/path/to/cashapp/funded/screenshot.jpg',
          released: '/path/to/cashapp/released/screenshot.jpg'
        }
      },
      paypal: {
        state: {
          funded: '/path/to/paypal/funded/screenshot.jpg',
          released: '/path/to/paypal/released/screenshot.jpg'
        }
      }
      // Define paths for other payment methods and states if needed
    }
  };
  