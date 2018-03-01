import React from 'react';
import { Clipboard, Alert, TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import { Tile, Button } from 'react-native-elements';
import { ImagePicker } from 'expo';

export default class App extends React.Component {
  state = {
    image: 'null',
    base64: null,
    tags: 'Click here to load and image'
  };

  render() {
    let { image } = this.state;

    return (
      <View style={{ marginBottom: 50, marginTop: 50, flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{flex: 0.2}}>
          <Text style={{ flex: 1, fontSize: 64, fontFamily: 'AvenirNextCondensed-Heavy', color: 'black'}}>
            Auto #Tags
          </Text>
        </View>
        <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center'}}>
          <TouchableOpacity
            onLongPress = {this.copyClipboard.bind(this)}
            onPress={this._pickImage}
            style={{ flex: 1}}
          >
          <Tile
            imageSrc={{uri: this.state.image}}
            title={this.state.tags}
            icon={{type: 'font-awesome'}}
          >
          </Tile>
          </TouchableOpacity>
          <Text>
            Press to load an image.
            LongPress to copy hashtags.
          </Text>
        </View>
      </View>
    );
  }

  copyClipboard(){
    Clipboard.setString(this.state.tags);
    Alert.alert('Copied!');
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri, base64: result.base64 });
    }
    this.setState({tags: 'loading...'})
    fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyADZxoWTjqJgr5XSl7OYfttr3f15Y-MQt8',{
      method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         "requests":[
           {
             "image":{
               "content":this.state.base64
             },
             "features":[
               {
                 "type":"LABEL_DETECTION",
               }
             ]
           }
         ]
       })
    })
    .then(response => response.json())
    .then(response => {
      const tags = response.responses[0].labelAnnotations;
      var hashtags = "";
      for(var i = 0;i<tags.length;i++){
        hashtags+="#"+tags[i].description.split(' ').join('')+" "
      }
      console.log(hashtags)
      this.setState({tags: hashtags})
    })


  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
