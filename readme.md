# Twitter Clock

## Installation
```bash
# Install GraphicsMagick
sudo apt-get update
sudo apt-get install graphicsmagick

# Install Node
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

# Install Forever (optional)
sudo npm install forever -g

# Install dependencies
yarn

```
## Setup

* Get your Twitter API keys.
  * Go to [https://apps.twitter.com/](https://apps.twitter.com/).
  * Click 'Create New App'.
  * Fill out the information and hit 'Create your Twitter application'.
  * Go to the 'Keys and Access Tokens' tab.
  * Scroll down and click on 'Generate My Token and Token Secret'.
  * Click on 'modify app permissions' in Application Settings and change the access to 'Read, Write and Access direct messages'.
* Put the corresponding keys in [config.json](config.json).
* Run the program using `node index.js` or, if you've installed forever, you can use `forever start index.js`