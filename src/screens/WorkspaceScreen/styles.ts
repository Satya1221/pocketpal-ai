import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container:{flex:1},
  hero:{paddingHorizontal:20,paddingTop:18,paddingBottom:12},
  tabs:{paddingHorizontal:16,paddingBottom:8,gap:8},
  tab:{paddingHorizontal:14,paddingVertical:8,borderRadius:18},
  content:{padding:16,paddingBottom:40,gap:12},
  row:{flexDirection:'row',alignItems:'center',gap:8},
  flex:{flex:1},
  card:{padding:14,borderRadius:16,borderWidth:1,borderColor:'#00000020',gap:8},
  input:{borderWidth:1,borderColor:'#00000020',borderRadius:12,padding:12,minHeight:44},
  editor:{borderRadius:12,padding:12,minHeight:110,textAlignVertical:'top',marginVertical:8},
  label:{fontWeight:'600',marginTop:8},
  result:{padding:10,borderRadius:10,marginTop:8,backgroundColor:'#00000008'},
  muted:{opacity:0.7,lineHeight:20},
  button:{paddingHorizontal:14,paddingVertical:9,borderRadius:18},
});
