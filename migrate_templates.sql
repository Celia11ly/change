-- Seed official_templates with data from src/constants/templates.ts
-- First, clear existing data to prevent duplicates (optional, safety for development)
truncate table official_templates;

insert into official_templates (title, description, thumbnail_url, cover_url, video_url, prompt, category, rating, likes, is_premium)
values
  (
    'Encounter in Zootopia',
    'Take a selfie with Judy and Nick in a cinema setting.',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop',
    'https://cdn.coverr.co/videos/coverr-at-the-cinema-2601/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成5秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、身形、服饰特征，人物面带自然微笑，身体微侧（右侧），眼神看向镜头与朱迪/尼克中间；\n【场景】沉浸式电影院场景，深色座椅排列整齐，前方荧幕显示《疯狂动物城》经典画面，周围有淡淡的爆米花烟雾特效（低透明度）；\n【互动】朱迪（兔子）站左侧抬手挥手，尼克（狐狸）站右侧手插口袋微笑，三者同框形成合影构图，人物与卡通角色比例协调；\n【风格】写实+卡通融合，色彩温暖，影院环境光柔和，无明显抠图痕迹；\n【时长】5秒，最后0.5秒画面轻微放大（增强合影氛围感）；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Cinematic',
    5.0,
    3420,
    true
  ),
  (
    'Dreamy Fish Tank',
    'A dreamy moment watching goldfish in a sunlit tank.',
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&h=750&fit=crop',
    'https://cdn.coverr.co/videos/coverr-goldfish-breathing-in-an-aquarium-207/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成6秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、发型、神态，人物侧脸面向鱼缸，眼神温柔注视水中，手部轻贴鱼缸玻璃（无穿透感）；\n【场景】简约北欧风房间，透明玻璃鱼缸（装满清水），缸内3-4条红/金色金鱼缓慢游动，水草轻晃，阳光透过窗户形成光斑落在人物脸上；\n【风格】日系唯美，低饱和暖色调，轻微柔光滤镜，水流波纹自然，鱼缸反光真实；\n【时长】6秒，金鱼游动轨迹平缓，人物全程保持温柔注视姿态，无多余动作；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Cinematic',
    4.8,
    1890,
    false
  ),
  (
    'Sunset Beach Walk',
    'Relaxing walk on the beach at sunset, waves washing over feet.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    'https://cdn.coverr.co/videos/coverr-walking-on-beach-sunset-4733/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成7秒短视频，720P分辨率，25fps；\n【主体】1:1还原人物的面部、穿搭（休闲度假风），人物赤脚站在沙滩上，裙摆/裤脚自然垂落；\n【场景】黄昏海边，细腻沙滩，海浪轻轻拍岸，远处是橘粉色晚霞，天空有2-3只海鸥低空飞过（虚化背景）；\n【动作】人物缓慢抬脚踩向浪花（水位没过脚踝），抬手整理头发，面带放松微笑，身体随海浪节奏轻微晃动；\n【风格】电影感暖橙色调，轻微颗粒感，海浪动态自然，沙滩纹理清晰；\n【时长】7秒，前4秒踩浪花，后3秒人物望向大海，画面缓慢拉远（凸显场景纵深感）；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Nature',
    4.9,
    2450,
    true
  ),
  (
    'Starlit Camping',
    'Pointing at the Milky Way under a starry sky while camping.',
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop',
    'https://cdn.coverr.co/videos/coverr-night-camping-sky-4643/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成8秒短视频，720P分辨率，25fps；\n【主体】1:1还原人物的面部、穿搭（露营服+毯子），人物坐在露营椅上，姿态放松；\n【场景】山野露营地，黑色天幕下璀璨星空（银河可见），旁边有暖光露营灯，后方搭有简约帐篷，地面有微弱篝火余温（红橙色微光）；\n【动作】人物抬手指向星空，缓慢转头微笑，偶尔低头喝一口热饮（杯子在手中），动作轻柔不夸张；\n【风格】梦幻治愈，冷色调星空+暖色调灯光对比，星空有缓慢星轨动态，画面无噪点；\n【时长】8秒，星空缓慢旋转，人物动作幅度小，氛围感突出；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Nature',
    4.9,
    1560,
    true
  ),
  (
    'Cafe Afternoon',
    'Enjoying a quiet afternoon reading with coffee.',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=550&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=825&fit=crop',
    'https://cdn.coverr.co/videos/coverr-coffee-shop-vibes-5034/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成5秒短视频，720P分辨率，25fps；\n【主体】1:1还原人物的面部、神态、穿搭（文艺风），人物坐在咖啡馆靠窗位置，坐姿端正；\n【场景】复古咖啡馆，木质桌椅，桌上有一杯拿铁（奶泡拉花清晰），窗户外是虚化的街道车流，室内暖黄色灯光；\n【动作】人物缓慢翻书（每2秒翻一页），偶尔抿一口咖啡，眼神专注看文字，表情平静；\n【风格】复古文艺，低饱和棕色调，轻微暗角，背景有轻微咖啡香气特效（浅白色薄雾）；\n【时长】5秒，翻书动作自然流畅，咖啡杯有淡淡的蒸汽（动态效果）；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Cinematic',
    4.6,
    980,
    false
  ),
  (
    'Ancient Lotus Pond',
    'Walking in a traditional courtyard admiring lotus flowers.',
    'https://picsum.photos/seed/ancient/400/400',
    'https://picsum.photos/seed/ancient/800/600',
    'https://cdn.coverr.co/videos/coverr-japan-garden-pond-1616/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成6秒短视频，720P分辨率，25fps；\n【主体】1:1还原人物的面部特征，适配古风汉服（根据人物气质自动匹配襦裙/曲裾），手持团扇；\n【场景】江南古风庭院，荷花池满池粉白荷花，木质回廊，周围有青竹点缀，轻微蝉鸣环境音（隐含提示）；\n【动作】人物缓慢走在回廊上，抬手轻触荷花花瓣（不破坏花瓣），团扇缓慢扇动，步伐轻盈；\n【风格】古风唯美，低饱和青绿色调，画面有轻微水墨晕染特效，荷花随微风自然摆动；\n【时长】6秒，人物行走轨迹平缓，背景有轻微流水声（动态氛围），画面边缘无畸变；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Cinematic',
    4.8,
    1150,
    true
  ),
  (
    'City Rooftop Sunset',
    'Enjoying the sunset view from a city rooftop.',
    'https://picsum.photos/seed/rooftop/400/600',
    'https://picsum.photos/seed/rooftop/600/900',
    'https://cdn.coverr.co/videos/coverr-sunset-in-the-city-2121/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成7秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、发型、穿搭特征，人物倚靠天台栏杆，身体微微前倾，眼神望向远方，面带惬意微笑；\n【场景】现代城市天台，地面铺有灰色防滑地砖，周围有少量绿植盆栽，远处是错落的高楼大厦，天空被橘红色晚霞铺满，云朵呈现渐变粉紫色；\n【动作】人物抬手轻轻拨弄头发，偶尔低头看一眼手机（屏幕微光），最后转头看向镜头微笑；\n【风格】清新治愈，暖色调光影，画面有轻微的光晕特效，远处城市建筑轻微虚化（突出主体）；\n【时长】7秒，前4秒远景，后3秒缓慢推近人物面部特写；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Cinematic',
    4.8,
    1240,
    true
  ),
  (
    'Flower Shop Moment',
    'Holding fresh sunflowers in a cozy flower shop.',
    'https://picsum.photos/seed/florist/400/400',
    'https://picsum.photos/seed/florist/800/800',
    'https://cdn.coverr.co/videos/coverr-hands-holding-flowers-2633/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成5秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、身形、穿搭特征，人物双手捧着一束向日葵（花束饱满，花瓣鲜艳），脸颊轻贴花束，笑容灿烂；\n【场景】温馨文艺花店，货架上摆满玫瑰、郁金香、满天星等鲜花，木质花架搭配暖黄色吊灯，地面散落少量花瓣；\n【动作】人物缓慢转动花束，展示不同角度，手指轻轻抚摸向日葵花瓣，最后举着花束对镜头比耶；\n【风格】甜美清新，高饱和色彩，画面明亮柔和，背景有轻微的花香薄雾特效；\n【时长】5秒，花束转动动作流畅，无卡顿；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Nature',
    4.9,
    2100,
    false
  ),
  (
    'Quiet Library Reading',
    'Focusing on a book by the window in a library.',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=900&fit=crop',
    'https://cdn.coverr.co/videos/coverr-turning-pages-of-book-5112/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成6秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、神态、穿搭特征，人物坐在图书馆靠窗的木质书桌前，低头专注阅读一本厚书，鼻梁上架着一副细框眼镜；\n【场景】安静的图书馆，书架上摆满整齐的书籍，阳光透过白色百叶窗洒在书页上，形成斑驳的光影，周围有轻微的翻书声（环境音暗示）；\n【动作】人物手指轻轻划过书页，偶尔停下托腮思考，嘴角微微上扬，最后抬头望向窗外，眼神温柔；\n【风格】知性文艺，低饱和冷色调，画面干净整洁，无多余杂物；\n【时长】6秒，光影随时间缓慢移动，凸显静谧氛围；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Cinematic',
    4.7,
    890,
    false
  ),
  (
    'Snowboarding Adventure',
    'Cool snowboarding action on a snowy mountain.',
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop',
    'https://cdn.coverr.co/videos/coverr-snowboarding-in-mountains-4643/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成8秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、穿搭特征，人物穿着滑雪服、戴着滑雪镜和头盔，脚踩单板，身体呈标准滑行姿势，表情专注；\n【场景】户外滑雪场，覆盖着厚厚的白色积雪，远处是连绵的雪山，天空湛蓝，周围有少量滑雪者的模糊身影；\n【动作】人物从缓坡上缓慢滑行，身体左右轻微摆动保持平衡，中途抬手向镜头挥手，最后平稳停下，摘下滑雪镜微笑；\n【风格】活力动感，冷色调为主，雪地反光自然，滑行轨迹清晰可见；\n【时长】8秒，滑行动作流畅，无违和感；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Nature',
    5.0,
    3500,
    true
  ),
  (
    'Night Market Foodie',
    'Tasting delicious street food at a bustling night market.',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=750&fit=crop',
    'https://cdn.coverr.co/videos/coverr-cooking-street-food-c4e95168/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成6秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、穿搭特征，人物站在夜市小吃摊前，手里拿着一串烤鱿鱼，嘴巴微张准备品尝，眼神充满期待；\n【场景】热闹的夜市，摊位上摆满各色小吃（烤串、奶茶、章鱼小丸子），霓虹灯牌闪烁，周围有熙熙攘攘的人群，背景有轻微的喧闹声（环境音暗示）；\n【动作】人物咬下一口烤鱿鱼，满足地眯起眼睛，竖起大拇指点赞，最后举起鱿鱼串向镜头展示；\n【风格】烟火气十足，高饱和暖色调，画面有轻微的颗粒感，凸显夜市氛围；\n【时长】6秒，小吃摊的灯光闪烁自然；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Travel',
    4.8,
    1950,
    true
  ),
  (
    'Art Gallery Visit',
    'Admiring paintings in a minimalist art gallery.',
    'https://picsum.photos/seed/gallery/400/600',
    'https://picsum.photos/seed/gallery/600/900',
    'https://cdn.coverr.co/videos/coverr-woman-looking-at-art-in-museum-2621/1080p.mp4',
    '【核心】基于上传的真人照片（垫图）生成7秒短视频，720P分辨率，25fps；\n【主体】1:1还原上传人物的面部、神态、穿搭特征，人物站在一幅抽象油画前，身体微微侧倾，双手背在身后，眼神专注欣赏画作；\n【场景】简约高级的美术馆，白色墙面搭配柔和的射灯，地面是光滑的灰色大理石，周围有几幅不同风格的画作，偶尔有参观者缓慢走过（虚化背景）；\n【动作】人物手指轻轻点向画作的某一处，低头小声自语（嘴型自然），最后转头看向镜头，露出浅浅的微笑；\n【风格】简约高级，低饱和色调，画面干净整洁，射灯光影精准打在画作和人物身上；\n【时长】7秒，镜头从画作缓慢移向人物，凸显艺术氛围感；\n强制保留上传图片中人物的 [五官 / 发型 / 服饰] 细节，禁止修改。',
    'Classic',
    4.6,
    1300,
    false
  );
