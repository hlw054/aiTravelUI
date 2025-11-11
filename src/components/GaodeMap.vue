<template>
  <div class="gaode-map-container">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';

// 声明AMap全局变量
declare global {
  interface Window {
    AMap: any;
  }
}

// 组件属性
interface Props {
  center?: [number, number]; // 地图中心点 [longitude, latitude]
  zoom?: number; // 地图缩放级别
  markers?: Array<{
    position: [number, number]; // 标记点位置
    title?: string; // 标记点标题
    content?: string; // 标记点内容
    icon?: string; // 自定义图标
  }>; // 标记点数组
  paths?: Array<[number, number]>; // 路径数组
}

// 定义组件属性
const props = withDefaults(defineProps<Props>(), {
  center: () => [116.404, 39.915], // 默认北京
  zoom: 12,
  markers: () => [],
  paths: () => []
});

// 定义组件事件
const emit = defineEmits<{
  (e: 'map-ready', map: any): void;
  (e: 'click', event: any): void;
  (e: 'zoom-change', zoom: number): void;
}>();

// 地图容器引用
const mapContainer = ref<HTMLElement>();

// 地图实例和相关对象引用
let mapInstance: any = null;
let markerInstances: any[] = [];
let pathInstance: any = null;
let currentInfoWindow: any = null;

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return;
  
  // 加载高德地图API
  loadMapApi().then(() => {
    // 创建地图实例
    mapInstance = new AMap.Map(mapContainer.value, {
      center: props.center,
      zoom: props.zoom,
      viewMode: '3D',
      showBuildingBlock: true,
      buildingAnimation: true,
      showLabel: true,
      // 显式启用拖动和缩放功能
      dragEnable: true,  // 启用地图拖拽
      zoomEnable: true   // 启用地图缩放（鼠标滚轮、双击等）
    });

    // 移除右上角插件控件，使地图更加简洁

    // 添加事件监听
    mapInstance.on('click', (e: any) => {
      emit('click', e);
    });

    mapInstance.on('zoomend', () => {
      emit('zoom-change', mapInstance.getZoom());
    });

    // 添加标记点
    updateMarkers();
    
    // 添加路径
    updatePath();

    // 触发地图就绪事件
    emit('map-ready', mapInstance);
  }).catch(error => {
    console.error('高德地图初始化失败:', error);
  });
};

// 加载高德地图API
const loadMapApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 使用官方加载器
    AMapLoader.load({
      key: '116d5bb98413b2587b2e94f554f64f4a', // 您申请的高德地图API Key
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.Geolocation'], // 需要使用的的插件列表，移除了地图控件相关插件
      AMapUI: { // 是否加载 AMapUI，缺省不加载
        version: '1.1', // AMapUI 缺省 1.1
        plugins: [], // 需要加载的 AMapUI ui插件列表
      },
      Loca: { // 是否加载 Loca，用于室内地图，缺省不加载
        version: '2.0' // Loca 版本，缺省 1.3.2
      },
      securityJsCode: 'd10e1ee3eeb7db34d6b4b5b71aba076e' // 安全密钥
    }).then((AMap) => {
      // 将AMap挂载到window上，便于后续使用
      (window as any).AMap = AMap;
      resolve();
    }).catch(error => {
      reject(new Error('高德地图API加载失败: ' + error));
    });
  });
};

// 更新标记点
const updateMarkers = () => {
  if (!mapInstance) return;
  
  // 清除现有标记点
  if (markerInstances.length > 0) {
    mapInstance.remove(markerInstances);
    markerInstances = [];
  }
  
  // 添加新标记点
  props.markers.forEach(marker => {
    const markerOptions: any = {
      position: marker.position,
      title: marker.title
    };
    
    // 如果有自定义图标
    if (marker.icon) {
      markerOptions.icon = new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: marker.icon,
        imageSize: new AMap.Size(32, 32)
      });
    }
    
    const markerInstance = new AMap.Marker(markerOptions);
    
    // 添加信息窗口
    if (marker.content) {
      const infoWindow = new AMap.InfoWindow({
        content: marker.content,
        offset: new AMap.Pixel(0, -30)
      });
      
      markerInstance.on('click', () => {
        // 打开新的信息窗口
        infoWindow.open(mapInstance, marker.position);
        currentInfoWindow = infoWindow;
      });
    }
    
    markerInstances.push(markerInstance);
  });
  
  // 批量添加到地图
  if (markerInstances.length > 0) {
    mapInstance.add(markerInstances);
  }
};

// 更新路径
const updatePath = () => {
  if (!mapInstance) return;
  
  // 清除现有路径
  if (pathInstance) {
    mapInstance.remove(pathInstance);
    pathInstance = null;
  }
  
  // 添加新路径
  if (props.paths && props.paths.length > 1) {
    pathInstance = new AMap.Polyline({
      path: props.paths,
      strokeColor: '#1890ff',
      strokeWeight: 4,
      strokeStyle: 'solid',
      strokeOpacity: 0.8
    });
    
    mapInstance.add(pathInstance);
  }
};

// 地图操作函数 - 对外暴露

// 设置地图中心点
const setCenter = (center: [number, number]) => {
  if (mapInstance) {
    mapInstance.setCenter(center);
  }
};

// 设置地图缩放级别
const setZoom = (zoom: number) => {
  if (mapInstance) {
    mapInstance.setZoom(zoom);
  }
};

// 缩放至指定范围
const setFitView = () => {
  if (mapInstance) {
    // 如果有标记点，调整视图以显示所有标记点
    if (markerInstances.length > 0) {
      mapInstance.setFitView(markerInstances);
    } else if (props.paths && props.paths.length > 1) {
      // 如果有路径，调整视图以显示整个路径
      mapInstance.setFitView([pathInstance]);
    }
  }
};

// 添加单个标记点
const addMarker = (marker: {
  position: [number, number];
  title?: string;
  content?: string;
  icon?: string;
}) => {
  if (!mapInstance) return;
  
  const markerOptions: any = {
    position: marker.position,
    title: marker.title
  };
  
  if (marker.icon) {
    markerOptions.icon = new AMap.Icon({
      size: new AMap.Size(32, 32),
      image: marker.icon,
      imageSize: new AMap.Size(32, 32)
    });
  }
  
  const markerInstance = new AMap.Marker(markerOptions);
  if (marker.content) {
    const infoWindow = new AMap.InfoWindow({
      content: marker.content,
      offset: new AMap.Pixel(0, -30)
    });
    
    markerInstance.on('click', () => {
      // 关闭之前打开的信息窗口
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      // 打开新的信息窗口
      infoWindow.open(mapInstance, marker.position);
      currentInfoWindow = infoWindow;
    });
  }
  
  mapInstance.add(markerInstance);
  markerInstances.push(markerInstance);
  
  return markerInstance;
};

// 清除所有标记点
const clearMarkers = () => {
  if (mapInstance && markerInstances.length > 0) {
    // 关闭当前打开的信息窗口
    if (currentInfoWindow) {
      currentInfoWindow.close();
      currentInfoWindow = null;
    }
    mapInstance.remove(markerInstances);
    markerInstances = [];
  }
}

// 设置路径
const setPath = (path: Array<[number, number]>) => {
  if (!mapInstance) return;
  
  // 清除现有路径
  if (pathInstance) {
    mapInstance.remove(pathInstance);
    pathInstance = null;
  }
  
  // 添加新路径
  if (path && path.length > 1) {
    pathInstance = new AMap.Polyline({
      path: path,
      strokeColor: '#1890ff',
      strokeWeight: 4,
      strokeStyle: 'solid',
      strokeOpacity: 0.8
    });
    
    mapInstance.add(pathInstance);
  }
};

// 清除路径
const clearPath = () => {
  if (mapInstance && pathInstance) {
    mapInstance.remove(pathInstance);
    pathInstance = null;
  }
};

// 获取当前地图中心
const getCenter = () => {
  if (mapInstance) {
    return mapInstance.getCenter();
  }
  return props.center;
};

// 获取当前地图缩放级别
const getZoom = () => {
  if (mapInstance) {
    return mapInstance.getZoom();
  }
  return props.zoom;
};

// 监听props变化
watch(() => props.center, (newCenter) => {
  if (mapInstance) {
    mapInstance.setCenter(newCenter);
  }
});

watch(() => props.zoom, (newZoom) => {
  if (mapInstance) {
    mapInstance.setZoom(newZoom);
  }
});

watch(() => props.markers, () => {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  updateMarkers();
}, { deep: true });

watch(() => props.paths, () => {
  updatePath();
}, { deep: true });

// 生命周期钩子
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  // 清理地图实例
  if (mapInstance) {
    mapInstance.destroy();
    mapInstance = null;
  }
  
  // 清理标记点、路径实例和信息窗口
  markerInstances = [];
  pathInstance = null;
  currentInfoWindow = null;
});

// 对外暴露方法
defineExpose({
  setCenter,
  setZoom,
  setFitView,
  addMarker,
  clearMarkers,
  setPath,
  clearPath,
  getCenter,
  getZoom,
  mapInstance
});
</script>

<style scoped>
.gaode-map-container {
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>