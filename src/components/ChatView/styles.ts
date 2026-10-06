import {StyleSheet} from 'react-native';
import {Theme} from '../../utils/types';

export const createStyles=({theme}:{theme:Theme})=>StyleSheet.create({
  container:{flex:1},
  flatList:{height:'100%'},
  flatListContentContainer:{flexGrow:1,paddingHorizontal:8},
  footer:{height:20},
  footerLoadingPage:{alignItems:'center',justifyContent:'center',marginTop:16,height:32},
  header:{height:4},
  menu:{width:170},
  scrollToBottomButton:{position:'absolute',right:16,backgroundColor:theme.colors.primary,width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.2,shadowRadius:4,elevation:4},
  suggestedPromptsOverlay:{position:'absolute',left:8,right:8,zIndex:9,backgroundColor:'transparent'},
  inputContainer:{position:'absolute',zIndex:10,left:0,right:0,bottom:0,paddingTop:6,paddingHorizontal:4,backgroundColor:theme.colors.background,...(!theme.dark?{boxShadow:`0px -4px 14px ${theme.colors.shadow}14`}: {})},
  chatContainer:{flex:1,position:'relative',backgroundColor:theme.colors.background,zIndex:0},
  headerWrapper:{zIndex:100},
  customBottomComponent:{position:'absolute',bottom:0,left:0,right:0},
  softCapBanner:{paddingHorizontal:12,paddingVertical:6,backgroundColor:theme.colors.surfaceVariant,borderTopWidth:1,borderBottomWidth:1,borderColor:theme.colors.outline},
  softCapBannerText:{fontSize:12,color:theme.colors.onSurfaceVariant,textAlign:'center' as const},
  banner:{paddingHorizontal:12,paddingVertical:8,borderTopWidth:1,borderBottomWidth:1},
  bannerText:{fontSize:12,lineHeight:17,color:theme.colors.onSurfaceVariant},
  bannerHeader:{flexDirection:'row' as const,alignItems:'center' as const,gap:6},
  bannerHeaderText:{flex:1,flexShrink:1},
  bannerPercent:{fontSize:12,fontWeight:'600' as const,fontVariant:['tabular-nums']},
  bannerMeter:{height:4,borderRadius:2,backgroundColor:theme.colors.surfaceDisabled,overflow:'hidden' as const,marginTop:8,alignSelf:'stretch' as const,width:'100%' as const},
  bannerMeterFill:{height:4,borderRadius:2},
  bannerActions:{flexDirection:'row' as const,flexWrap:'wrap' as const,alignItems:'center' as const,justifyContent:'flex-end' as const,marginTop:2},
});