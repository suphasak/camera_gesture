#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

// Import the generated Swift header for this pod. The name follows the pod
// module name (HandPose). The guards cover static-lib and framework layouts.
#if __has_include("HandPose-Swift.h")
#import "HandPose-Swift.h"
#elif __has_include(<HandPose/HandPose-Swift.h>)
#import <HandPose/HandPose-Swift.h>
#endif

// Registers the Swift plugin under the JS name "detectHands" at load time.
@interface HandPosePluginLoader : NSObject
@end

@implementation HandPosePluginLoader

+ (void)load {
  [FrameProcessorPluginRegistry
      addFrameProcessorPlugin:@"detectHands"
              withInitializer:^FrameProcessorPlugin* _Nonnull(
                  VisionCameraProxyHolder* _Nonnull proxy,
                  NSDictionary* _Nullable options) {
                return [[HandPoseFrameProcessorPlugin alloc] initWithProxy:proxy
                                                              withOptions:options];
              }];
}

@end
