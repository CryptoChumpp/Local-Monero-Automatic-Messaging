const fetch = require('node-fetch');
const fs = require('fs');
const { apiKey, endpoint, minimumFeedback, minimumTrades, verifiedBuyerMessages, unverifiedBuyerMessages, sendScreenshot, screenshotPath } = require('./config');

// Utility function to check if the user has traded before
async function checkTradedBefore(username) {
  try {
    const response = await fetch(`${endpoint}/account_info/${username}/trades/active`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyTradeProcessor',
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trade history: ${response.status}`);
    }

    console.log('User has traded before');
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

// Utility function to get the user's stats (number of trades and feedback score)
async function getUserStats(username) {
  try {
    // Fetch the user's number of trades and feedback score from your database or any other source
    const numberOfTrades = 10; // Replace with the actual number of trades
    const feedbackScore = 4.5; // Replace with the actual feedback score
    return { numberOfTrades, feedbackScore };
  } catch (error) {
    console.error('Error:', error.message);
    return { numberOfTrades: 0, feedbackScore: 0 };
  }
}

// Function to check user verification status and minimum requirements
async function checkUserVerification(tradeId, paymentMethod, state, isVerified) {
  try {
    const dashboardResponse = await fetch(`${endpoint}/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyTradeProcessor',
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Failed to fetch dashboard: ${dashboardResponse.status}`);
    }

    const trades = await dashboardResponse.json();
    const trade = trades.find((t) => t.id === tradeId);

    if (!trade) {
      throw new Error('Trade not found in the dashboard');
    }

    const { username } = trade;

    // Check if the user has traded before
    const tradedBefore = await checkTradedBefore(username);

    // Get the user's stats (number of trades and feedback score)
    const { numberOfTrades, feedbackScore } = await getUserStats(username);

    // Check if the buyer's stats meet the minimum requirements
    if (tradedBefore || numberOfTrades >= minimumTrades || feedbackScore >= minimumFeedback) {
      console.log('Buyer meets the minimum requirements');
      return true;
    } else {
      console.log('Buyer does not meet the minimum requirements');
      return false;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

// Function to send a message to a trade
async function sendMessage(tradeId, message, paymentMethod) {
  try {
    const response = await fetch(`${endpoint}/trades/${tradeId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyTradeProcessor',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message:', response.status);
    }

    // Check if sending a screenshot is enabled for the payment method and state combination
    if (sendScreenshot.hasOwnProperty(paymentMethod) && sendScreenshot[paymentMethod].state.hasOwnProperty(state)) {
      if (sendScreenshot[paymentMethod].state[state]) {
        // Send the screenshot
        const screenshot = fs.readFileSync(screenshotPath[paymentMethod].state[state]);
        await sendScreenshot(tradeId, screenshot);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to send a screenshot for a trade
async function sendScreenshot(tradeId, screenshot) {
  try {
    const response = await fetch(`${endpoint}/trades/${tradeId}/screenshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'User-Agent': 'MyTradeProcessor',
        Authorization: `Bearer ${apiKey}`
      },
      body: screenshot
    });

    if (response.ok) {
      console.log('Screenshot sent successfully');
    } else {
      console.error('Failed to send screenshot:', response.status);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to process active trades
async function processActiveTrades() {
  try {
    const dashboardResponse = await fetch(`${endpoint}/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyTradeProcessor',
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Failed to fetch active trades: ${dashboardResponse.status}`);
    }

    const trades = await dashboardResponse.json();
    console.log('Active trades:', trades);

    // Create an array of promises for checking each trade
    const tradePromises = trades.map(async (trade) => {
      const { id, paymentMethod, state, username } = trade;

      // Check if the trade's payment method is in the desired list
      if (paymentMethods.includes(paymentMethod)) {
        // Determine if the user is verified or not
        const isVerified = await checkUserVerification(id, paymentMethod, state);

        // Choose the appropriate set of messages based on the verification status
        const messages = isVerified ? verifiedBuyerMessages : unverifiedBuyerMessages;

        // Check if there is a custom message for the payment method and state combination
        if (messages.hasOwnProperty(paymentMethod) && messages[paymentMethod].state.hasOwnProperty(state)) {
          sendMessage(id, messages[paymentMethod].state[state], paymentMethod);
        } else {
          // Handle the case when there is no specific message for the payment method and state combination
          console.log('No message found for the payment method and state combination');
        }
      }
    });

    // Await all trade promises to ensure they are all processed
    await Promise.all(tradePromises);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Interval for checking active trades
setInterval(processActiveTrades, 5000);
