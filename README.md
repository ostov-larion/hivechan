# hivechan
A project for simple deployment of nanoboards.

![cover](https://github.com/ostov-larion/hivechan/blob/main/cover.png?raw=true)

# Preparing
Since most internet operators do not provide IPv6 addresses to clients, you need to install Teredo / Miredo.

## Windows
```batch
ipv6 install netsh int ipv6 set teredo client
```

## Linux (Debian-based)
```bash
sudo apt-get install miredo
```

# Install
```bash
git clone https://www.github.com/ostov-larion/hivechan
cd hivechan
npm run build
```

# Run
```bash
node index.js
```
