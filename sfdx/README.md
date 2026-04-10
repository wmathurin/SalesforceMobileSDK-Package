# sfdx-mobilesdk-plugin 

A plugin for the Salesforce CLI to create mobile applications to interface with the [Salesforce Platform](http://www.salesforce.com/platform/overview/), leveraging the [Salesforce Mobile SDK for iOS](https://github.com/forcedotcom/SalesforceMobileSDK-iOS) and the [Salesforce Mobile SDK for Android](https://github.com/forcedotcom/SalesforceMobileSDK-Android) repos.

## Setup

### Install from source

1. Install the Salesforce CLI (https://developer.salesforce.com/tools/salesforcecli).

2. Clone the repository: `git clone git@github.com:forcedotcom/SalesforceMobileSDK-Package`

3. Install npm modules: `npm install`

4. Generate oclif command classes `./sfdx/generate_oclif.js`

5. Link the plugin: `sf plugins link sfdx`

### Install as plugin

1. Install plugin: `sf plugins install sfdx-mobilesdk-plugin`

## Help
```
-> sf mobilesdk --help
```

## Create a native iOS application 
### Help for iOS
```
-> sf mobilesdk ios --help
```

### Create Objective-C (native) or Swift (native_swift) application
```
-> sf mobilesdk ios create --help
```

### List available native iOS templates
```
-> sf mobilesdk ios listtemplates --help
```

### Create iOS application from template
```
-> sf mobilesdk ios createwithtemplate --help
```

### Check store or syncs config
```
-> sf mobilesdk ios checkconfig --help
```

## Create a native Android application 
### Help for Android
```
-> sf mobilesdk android --help
```

### Create Java (native) or Kotlin (native_kotlin) application
```
-> sf mobilesdk android create --help
```

### List available native Android templates
```
-> sf mobilesdk android listtemplates --help
```

### Create Android application from template
```
-> sf mobilesdk android createwithtemplate --help
```

### Check store or syncs config
```
-> sf mobilesdk android checkconfig --help
```

## Create an hybrid application 
### Help for hybrid
```
-> sf mobilesdk hybrid --help
```

### Create hybrid application
```
-> sf mobilesdk hybrid create --help
```

### List available hybrid templates
```
-> sf mobilesdk hybrid listtemplates --help
```

### Create hybrid application from template
```
-> sf mobilesdk hybrid createwithtemplate --help
```

### Check store or syncs config
```
-> sf mobilesdk hybrid checkconfig --help
```

## Create a React Native application
### Help for React Native
```
-> sf mobilesdk reactnative --help
```

### Create React Native application
```
-> sf mobilesdk reactnative create --help
```

### List available React Native templates
```
-> sf mobilesdk reactnative listtemplates --help
```

### Create React Native application from template
```
-> sf mobilesdk reactnative createwithtemplate --help
```

### Check store or syncs config
```
-> sf mobilesdk reactnative checkconfig --help
```

