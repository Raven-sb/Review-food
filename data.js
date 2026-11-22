/* Dữ liệu quán ăn mẫu, tham chiếu theo cách Google Maps hiển thị đánh giá.
   Đây là dữ liệu minh họa (không phải kết quả gọi API thời gian thực).
   Dùng phần "Google Maps API" trong giao diện để lấy dữ liệu thật. */

const CITY_CENTERS = {
  'Hà Nội': [21.0278, 105.8342],
  'TP. Hồ Chí Minh': [10.8231, 106.6297],
  'Đà Nẵng': [16.0544, 108.2022],
  'Huế': [16.5959, 107.7181],
  'Hội An': [15.8801, 108.3380],
  'Cần Thơ': [10.0332, 105.7665],
  'Hải Phòng': [20.8449, 106.6881],
  'Nha Trang': [12.2388, 109.1967],
  'Đà Lạt': [11.9404, 108.4583],
  'Nghệ An': [18.6725, 105.7141]
};

const CUISINE_EMOJI = {
  'Phở': '🍜', 'Bún chả': '🍢', 'Bánh mì': '🥖', 'Cà phê': '☕',
  'Nhà hàng': '🍽️', 'Món Huế': '🍲', 'Hải sản': '🦐', 'Bún bò': '🍜',
  'Cao lầu': '🍝', 'Bánh': '🥮', 'Lẩu': '🔥', 'Đường phố': '🍡',
  'Chay': '🌱', 'Mì Quảng': '🍜', 'Bánh đa cua': '🦀', 'Cháo': '🥣'
};

const GENERIC_REVIEWS = {
  'Phở': 'Nước dùng ngọt, sợi phở tơi và thịt bò tươi. Đến sớm thì không phải chờ lâu.',
  'Bún chả': 'Thịt nướng thơm, nước mắm chấm vừa miệng, thêm chút đu đủ giòn là hết ý.',
  'Bánh mì': 'Bánh giòn, nhân đầy, sốt đặc trưng. Một ổ cầm đi ăn vừa tiện vừa no lâu.',
  'Cà phê': 'Cà phê đậm đà, không gian yên tĩnh, ngồi làm việc hay trò chuyện đều hợp.',
  'Nhà hàng': 'Món làm kỹ, cách trình bày đẹp, nhân viên thân thiện. Đưa người nhà đi ăn rất ổn.',
  'Món Huế': 'Hương vị Huế rõ rệt, gia vị vừa phải, ăn cùng cơm trắng là đúng bài.',
  'Hải sản': 'Hải sản tươi, chế biến nhanh, giá khá hợp lý so với chất lượng.',
  'Bún bò': 'Nước lèo cay nhẹ, thơm sả, thịt bò mềm. Ăn nóng là nhất.',
  'Cao lầu': 'Đúng vị Hội An, sợi dai, thịt xáu thơm, ăn kèm rau sống tươi.',
  'Bánh': 'Bánh ngọt vừa, không bị gắt, mua về làm quà cũng được.',
  'Lẩu': 'Nước lẩu đậm, nguyên liệu tươi, ăn cùng bạn bè cuối tuần rất vui.',
  'Đường phố': 'Quán nhỏ nhưng đông khách, món ra nhanh và giá mềm.',
  'Chay': 'Món chay thanh đạm mà vẫn đậm đà, tinh tế.',
  'Mì Quảng': 'Sợi mì vàng, nước dùng cô đặc, lạc rang giòn thơm.',
  'Bánh đa cua': 'Bánh đa giòn, nước súp ngọt cua, ăn nóng là tuyệt.',
  'Cháo': 'Cháo lươn mịn, gia vị vừa vặn, ăn sáng rất ấm bụng.'
};

function p(id, name, city, district, address, cuisine, priceLevel, price, rating, reviewCount,
  lat, lng, photo, tags, description, dishes, hours, sample) {
  const generic = GENERIC_REVIEWS[cuisine] || 'Món ngon, giá hợp lý, quán sạch sẽ. Sẽ quay lại lần nữa.';
  return {
    id, name, city, district, address, cuisine, priceLevel, price,
    rating, reviewCount, lat, lng,
    image: photo ? `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=900&q=80` : '',
    tags, description, dishes, hours, phone: '', website: '',
    source: 'curated',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}, ${city}`)}`,
    reviewsSample: [
      { author: sample[0], rating: sample[1] >= 4 ? 5 : 4, date: sample[2], text: sample[3] },
      { author: 'Khách ghé gần đây', rating: 5, date: '1 tháng trước', text: generic }
    ]
  };
}

const CURATED_PLACES = [
  p('hn-pho-hang-pong', 'Phở Hàng Pòng', 'Hà Nội', 'Hoàn Kiếm', '65 Hàng Pòng, Hoàn Kiếm', 'Phở', 1, '30.000 – 60.000 ₫', 4.4, 2847,
    21.0338, 105.8489, '1563245372-f21724e3856d', ['Phở bò', 'Ăn sáng', 'Đường phố'],
    'Quán phở nhỏ nằm trong ngõ phố cổ, nổi tiếng với nước dùng trong và vị bò tái tươi. Bữa sáng ở đây luôn đông nhưng ra món rất nhanh.',
    ['Phở tái', 'Phở chín', 'Nạm, gân'], '05:00 – 10:00', ['Anh Dũng', 5, '3 tuần trước', 'Phở ở đây có vị rất Hà Nội, nước dùng trong mà đậm. Sáng sớm ra đã có người chờ rồi.']),

  p('hn-bun-cha-huong-lien', 'Bún chả Hương Liên', 'Hà Nội', 'Hoàn Kiếm', '24 Lê Văn Hưu, Hoàn Kiếm', 'Bún chả', 1, '40.000 – 80.000 ₫', 4.4, 5621,
    21.0289, 105.8539, '1559847844-5315695dadae', ['Bún chả', 'Thịt nướng', 'Trưa'],
    'Địa chỉ bún chả quen thuộc giữa phố cổ, từng đón khách quốc tế. Thịt nướng than hoa thơm, chấm nước mắm pha chua ngọt.',
    ['Bún chả thịt nướng', 'Bún chả cá', 'Đu đủ muối'], '10:00 – 21:00', ['Thu Hà', 5, '1 tuần trước', 'Thịt nướng vừa miệng, bún tơi, thêm chút tỏi ớt là đỉnh.']),

  p('hn-cha-ca-la-vong', 'Chả cá Lã Vọng', 'Hà Nội', 'Hoàn Kiếm', '14 Chả Cá, Hàng Mành, Hoàn Kiếm', 'Nhà hàng', 2, '150.000 – 300.000 ₫', 4.3, 4890,
    21.0342, 105.8543, '1517248135467-4c7edcad34c4', ['Chả cá', 'Đặc sản', 'Phố cổ'],
    'Món chả cá truyền thống nướng than, ăn kèm bún, rau và mắm tôm pha. Không gian cổ kính, phù hợp tiếp khách và ăn gia đình.',
    ['Chả cá nướng', 'Bún chả cá', 'Mắm tôm pha'], '11:00 – 22:00', ['Minh Khôi', 4, '2 tuần trước', 'Vị chả cá đậm, ăn kèm rau thơm rất hợp. Giá hơi cao nhưng đáng thử một lần.']),

  p('hn-ca-phe-giang', 'Cà phê Giảng', 'Hà Nội', 'Hoàn Kiếm', '109 Nguyễn Văn Huyên, Cầu Giấy', 'Cà phê', 1, '25.000 – 55.000 ₫', 4.2, 2130,
    21.0296, 105.7928, '1495474472287-4d71bcdd2085', ['Cà phê trứng', 'Hà Nội', 'Ngồi lâu'],
    'Cái nôi của cà phê trứng Hà Nội. Cà phê đen đậm, kem trứng béo ngậy, quán luôn tấp nập từ sáng đến tối.',
    ['Cà phê trứng', 'Cà phê đen', 'Cà phê sữa đá'], '06:00 – 23:00', ['Lan Anh', 5, '5 ngày trước', 'Cà phê trứng ở đây đúng chuẩn, béo mà không ngấy.']),

  p('hn-banh-mi-hoa-binh', 'Bánh mì Hòa Bình', 'Hà Nội', 'Đống Đa', '18 Đặng Văn Ngữ, Đống Đa', 'Bánh mì', 1, '20.000 – 45.000 ₫', 4.3, 1876,
    21.0076, 105.8369, '1555126634-323283e090fa', ['Bánh mì', 'Ăn vặt', 'Giá rẻ'],
    'Bánh mì nóng giòn, nhân thịt nguội và pate đầy đặn. Quán bán theo ca, mua mang đi rất tiện.',
    ['Bánh mì đặc biệt', 'Bánh mì pate', 'Bánh mì nướng'], '06:30 – 20:00', ['Đức Anh', 5, '3 tuần trước', 'Vỏ bánh giòn tan, pate thơm. Mua ổ về vẫn giòn.']),

  p('hn-bun-dau-co-duong', 'Bún đậu mắm tôm Cô Đường', 'Hà Nội', 'Ba Đình', '51 Nguyễn Biểu, Ba Đình', 'Đường phố', 1, '50.000 – 120.000 ₫', 4.5, 3412,
    21.0312, 105.8397, '1546069901-ba9599a7e63c', ['Bún đậu', 'Mắm tôm', 'Ăn nhóm'],
    'Đậu rán giòn, thịt luộc, chả cốm và mắm tôm pha đúng vị. Quán đông, hợp ăn nhóm bạn bè buổi chiều.',
    ['Bún đậu mắm tôm', 'Chả cốm', 'Nem chua rán'], '10:00 – 21:30', ['Hà My', 5, '1 tuần trước', 'Mắm tôm pha ngon, đậu giòn. Đi nhóm 4 người gọi đủ món rất đã.']),

  p('hcm-pho-hoa', 'Phở Hòa', 'TP. Hồ Chí Minh', 'Quận 1', '280 Lê Văn Sỹ, Phường 14, Quận 1', 'Phở', 1, '35.000 – 70.000 ₫', 4.4, 3120,
    10.8074, 106.6796, '1563245372-f21724e3856d', ['Phở bò', 'Sài Gòn', 'Đông khách'],
    'Quán phở bò lâu năm giữa Sài Gòn, nước dùng đậm và thơm quế hồi. Khách đông nhưng bàn quay nhanh.',
    ['Phở tái', 'Phở gân', 'Phở nạm'], '05:30 – 22:00', ['Quốc Bảo', 5, '2 tuần trước', 'Phở nước dùng đậm, thịt bò tươi. Ăn tối vẫn thấy ngon.']),

  p('hcm-banh-mi-huynh-hoa', 'Bánh mì Huynh Hoa', 'TP. Hồ Chí Minh', 'Quận 1', '26 Lê Thị Riêng, Quận 1', 'Bánh mì', 1, '68.000 – 88.000 ₫', 4.5, 7840,
    10.8039, 106.7011, '1555126634-323283e090fa', ['Bánh mì', 'Sài Gòn', 'Có hàng đợi'],
    'Ổ bánh mì "đầy nhân" nổi tiếng nhất Sài Gòn với pate, thịt nguội, chả bông và sốt đặc trưng. Đường nào cũng có người xếp hàng.',
    ['Bánh mì đặc biệt', 'Bánh mì pate', 'Bánh mì chả bông'], '15:00 – 23:00', ['Thảo Linh', 4, '4 ngày trước', 'Nhân cực đầy, cắn một miếng là no. Đợi khoảng 10 phút thì được.']),

  p('hcm-com-tam-ba-ghien', 'Cơm tấm Ba Ghiền', 'TP. Hồ Chí Minh', 'Quận 3', '171 Kỳ Đồng, Quận 3', 'Nhà hàng', 1, '45.000 – 95.000 ₫', 4.3, 4560,
    10.8194, 106.6837, '1512058564366-18510be2db19', ['Cơm tấm', 'Sườn nướng', 'Trưa'],
    'Cơm tấm sườn nướng than, chấm mắm nhỉ và ăn kèm bì, chả, trứng. Khẩu phần đầy đặn, hợp bữa trưa làm việc.',
    ['Cơm tấm sườn nướng', 'Cơm tấm bì', 'Canh chua'], '07:00 – 21:00', ['Văn Thành', 5, '1 tháng trước', 'Sườn nướng thơm, cơm tấm dẻo. Mắm nhỉ đúng vị.']),

  p('hcm-nha-hang-ngon', 'Nhà hàng Ngon', 'TP. Hồ Chí Minh', 'Quận 1', '160 Pasteur, Bến Thành, Quận 1', 'Nhà hàng', 2, '120.000 – 350.000 ₫', 4.2, 9180,
    10.8196, 106.7009, '1552566626-52f8b828add9', ['Ẩm thực Việt', 'Nhiều món', 'Giữa trung tâm'],
    'Khu ẩm thực với nhiều gian hàng món Việt từ ba miền, không gian rộng rãi, phù hợp cả gia đình lẫn tiếp khách.',
    ['Bánh xèo', 'Bún bò Huế', 'Cá kho tộ'], '10:00 – 22:00', ['Ánh Nguyệt', 4, '2 tuần trước', 'Nhiều lựa chọn, ngồi mát. Bánh xèo và bún bò ở đây ngon.']),

  p('hcm-hai-san-ong-giao', 'Hải sản Ông Giáo', 'TP. Hồ Chí Minh', 'Quận 7', '42 Nguyễn Thị Thập, Quận 7', 'Hải sản', 2, '180.000 – 600.000 ₫', 4.4, 2670,
    10.7272, 106.7336, '1540189549336-e6e99c3679fe', ['Hải sản', 'Tươi', 'Ăn nhóm'],
    'Hải sản tươi bày sẵn, chế biến theo yêu cầu. Tôm càng xanh, cua hoàng đế và mực nướng là các món được khen nhiều.',
    ['Tôm nướng muối ớt', 'Cua hoàng đế', 'Mực nướng'], '16:00 – 23:00', ['Đình Khoa', 5, '3 tuần trước', 'Tôm tươi, nướng muối ớt rất thơm. Nhân viên tư vấn kỹ.']),

  p('hcm-bun-bo-co-lanh', 'Bún bò Huế Cô Lành', 'TP. Hồ Chí Minh', 'Quận 10', '62 Sư Vạn Hạnh, Quận 10', 'Bún bò', 1, '45.000 – 75.000 ₫', 4.4, 3980,
    10.8166, 106.6665, '1569718212165-3a8278d5f624', ['Bún bò', 'Huế', 'Cay nhẹ'],
    'Bún bò nước lèo thơm sả, cay vừa, ăn kèm chả lụa và rau sống tươi. Quán mở tới khuya.',
    ['Bún bò Huế', 'Bún bò gân', 'Chả lụa'], '07:00 – 23:30', ['Mỹ Dung', 5, '1 tuần trước', 'Nước dùng đậm, sả thơm, ăn nóng rất đã.']),

  p('dn-mi-quang-ba-mua', 'Mì Quảng Bà Mua', 'Đà Nẵng', 'Hải Châu', '119 Trần Phú, Hải Châu', 'Mì Quảng', 1, '30.000 – 55.000 ₫', 4.4, 3240,
    16.0651, 108.2207, '1559847844-5315695dadae', ['Mì Quảng', 'Đặc sản', 'Sáng sớm'],
    'Mì Quảng sợi vàng, nước dùng cô đặc với tôm thịt, rau sống tươi và lạc rang. Món sáng đặc trưng của Đà Thành.',
    ['Mì Quảng tôm thịt', 'Mì Quảng gà', 'Bánh tráng'], '06:00 – 11:00', ['Trung Nghĩa', 5, '2 tuần trước', 'Đúng vị mì Quảng Đà Nẵng, lạc rang thơm, rau tươi.']),

  p('dn-bun-cha-ca-ba-lu', 'Bún chả cá Bà Lữ', 'Đà Nẵng', 'Hải Châu', '73 Nguyễn Chí Thanh, Hải Châu', 'Hải sản', 1, '35.000 – 70.000 ₫', 4.4, 2740,
    16.0634, 108.2146, '1529042410759-befb1204b468', ['Chả cá', 'Bún', 'Đà Nẵng'],
    'Chả cá quết dai, nướng thơm, ăn cùng bún và nước mắm chua ngọt. Quán đông khách địa phương mỗi buổi trưa.',
    ['Bún chả cá', 'Chả cá nướng', 'Mắm ruốc'], '07:00 – 20:00', ['Hồng Nhung', 4, '1 tháng trước', 'Chả cá dai và thơm, nước mắm chấm vừa.']),

  p('dn-banh-trang-cuon-thit-heo', 'Bánh tráng cuốn thịt heo Trần', 'Đà Nẵng', 'Sơn Trà', '16 Lê Đình Dương, Sơn Trà', 'Đường phố', 1, '40.000 – 90.000 ₫', 4.5, 1980,
    16.0976, 108.2497, '1504674900247-0877df9cc836', ['Bánh tráng', 'Cuốn', 'Gần biển'],
    'Thịt heo luộc mỏng, bánh tráng mỏng giòn, cuốn cùng rau và nước mắm chuẩn vị. Ăn nhẹ mà rất đã.',
    ['Thịt heo cuốn bánh tráng', 'Nem nướng', 'Nước mắm pha'], '10:00 – 21:00', ['Thanh Tùng', 5, '5 ngày trước', 'Thịt mềm, rau tươi, tự cuốn ăn rất thú vị.']),

  p('hue-bun-bo-mu-roi', 'Bún bò Mụ Rơi', 'Huế', 'Phạm Ngũ Lão', '8 Nguyễn Bỉnh Khiêm, Phạm Ngũ Lão', 'Bún bò', 1, '35.000 – 60.000 ₫', 4.5, 4120,
    16.0665, 107.7950, '1547592180-85f173990554', ['Bún bò', 'Huế', 'Gốc'],
    'Một trong những quán bún bò Huế lâu đời nhất, nước lèo đậm, cay nhẹ và thơm sả. Ăn sáng kiểu Huế đúng nghĩa.',
    ['Bún bò Huế', 'Bún bò gân', 'Chả lụa'], '05:30 – 14:00', ['Phạm Hương', 5, '2 tuần trước', 'Vị bún bò Huế chuẩn nhất từng ăn, nước dùng rất đậm.']),

  p('hue-com-am-phu', 'Cơm Âm Phủ', 'Huế', 'Thuận Hóa', '29 Nguyễn Đình Chiểu, Thuận Hóa', 'Món Huế', 1, '40.000 – 90.000 ₫', 4.4, 2210,
    16.0701, 107.8030, '1512058564366-18510be2db19', ['Cơm Âm Phủ', 'Món Huế', 'Gia đình'],
    'Các món dân dã Huế chế biến tinh: cá kho, thịt rang cháy cạnh, rau luộc và mắm ruốc. Bữa cơm ấm cúng giữa cố đô.',
    ['Cơm Âm Phủ', 'Cá kho tộ', 'Mắm ruốc'], '10:00 – 21:00', ['Đức Minh', 4, '3 tuần trước', 'Cơm ngon, món Huế đúng vị, nhân viên hiếu khách.']),

  p('hoian-cao-lau-ba-do', 'Cao lầu Bà Đỏ', 'Hội An', 'Cẩm Châu', '78 Đại lộ Hùng Vương, Cẩm Châu', 'Cao lầu', 1, '35.000 – 60.000 ₫', 4.4, 3560,
    15.8840, 108.3280, '1569718212165-3a8278d5f624', ['Cao lầu', 'Hội An', 'Đặc sản'],
    'Cao lầu sợi dai, trộn cùng thịt xáu, rau sống và mắm tôm pha. Món ăn gắn liền với phố cổ Hội An.',
    ['Cao lầu đặc biệt', 'Cao lầu thịt xáu', 'Nước mắm pha'], '07:00 – 20:00', ['Trang Nhi', 5, '1 tuần trước', 'Đúng cao lầu Hội An, sợi dai, thịt thơm.']),

  p('hoian-banh-mi-phuong', 'Bánh mì Phượng', 'Hội An', 'Minh An', '2B Phạm Thị Bích, Minh An', 'Bánh mì', 1, '30.000 – 55.000 ₫', 4.4, 8210,
    15.8790, 108.3260, '1555126634-323283e090fa', ['Bánh mì', 'Hội An', 'Có hàng đợi'],
    'Ổ bánh mì nhỏ nổi tiếng trong phố cổ, nhân pate và thịt nguội đầy, luôn có người xếp hàng.',
    ['Bánh mì đặc biệt', 'Bánh mì pate', 'Bánh mì nướng'], '10:00 – 20:00', ['Kelly Trần', 4, '2 tuần trước', 'Bánh giòn, nhân đầy. Đợi một chút nhưng đáng.']),

  p('cantho-song-nuoc', 'Nhà hàng Sông Nước', 'Cần Thơ', 'Ninh Kiều', '20 Võ Thị Sáu, Ninh Kiều', 'Nhà hàng', 2, '120.000 – 300.000 ₫', 4.3, 1640,
    10.0309, 105.7682, '1552566626-52f8b828add9', ['Miền Tây', 'Sông nước', 'Gia đình'],
    'Nhà hàng ven sông với các món miền Tây: cá nướng, bánh xèo, lẩu mắm. Không gian thoáng, hợp ăn chiều.',
    ['Cá nướng muối ớt', 'Lẩu mắm', 'Bánh xèo'], '10:00 – 22:00', ['Hữu Lộc', 4, '1 tháng trước', 'Ngồi gần sông mát, cá nướng tươi và ngon.']),

  p('hp-banh-da-cua-ba-do', 'Bánh đa cua Bà Đỏ', 'Hải Phòng', 'Hồng Bàng', '12 Điện Biên Phủ, Hồng Bàng', 'Bánh đa cua', 1, '35.000 – 70.000 ₫', 4.4, 2380,
    20.8507, 106.6846, '1547592180-85f173990554', ['Bánh đa cua', 'Hải Phòng', 'Sáng sớm'],
    'Bánh đa đỏ giòn, nước súp ngọt cua, ăn kèm chả cá và rau sống. Đặc sản sáng của người Hải Phòng.',
    ['Bánh đa cua', 'Chả cá', 'Gân cua'], '06:00 – 14:00', ['Anh Tuấn', 5, '3 tuần trước', 'Đúng vị Hải Phòng, nước cua ngọt, bánh giòn.']),

  p('nt-cha-ca-tu-hanh', 'Chả cá Tư Hạnh', 'Nha Trang', 'Lộc Thọ', '36 Nguyễn Thiện Thuật, Lộc Thọ', 'Hải sản', 1, '45.000 – 95.000 ₫', 4.4, 1950,
    12.2405, 109.1936, '1529042410759-befb1204b468', ['Chả cá', 'Nha Trang', 'Biển'],
    'Chả cá quết tươi nướng than, ăn cùng bún, rau và mắm nêm pha. Món chiều được nhiều khách lặp lại.',
    ['Chả cá nướng', 'Bún chả cá', 'Mắm nêm'], '10:00 – 21:00', ['Nhật Minh', 5, '2 tuần trước', 'Chả cá tươi, nướng thơm, mắm nêm pha ngon.']),

  p('dl-lau-ga-la-e', 'Lẩu gà lá é Đà Lạt', 'Đà Lạt', 'Phường 1', '27 Nguyễn Chí Thanh, Phường 1', 'Lẩu', 2, '180.000 – 450.000 ₫', 4.5, 2870,
    11.9378, 108.4413, '1546069901-ba9599a7e63c', ['Lẩu gà', 'Lá é', 'Ăn tối'],
    'Lẩu gà nóng với lá é thơm lừng, nước dùng ngọt, ăn kèm rau núng và mì. Món ăn làm ấm người giữa trời Đà Lạt lạnh.',
    ['Lẩu gà lá é', 'Mì tươi', 'Rau núng'], '11:00 – 22:00', ['Thùy Linh', 5, '1 tuần trước', 'Thơm lá é, nước lẩu ngọt, ăn tối ở Đà Lạt là hợp nhất.']),

  p('nghe-chao-luon-vinh', 'Cháo lươn Vinh', 'Nghệ An', 'Vinh', '54 Lê Duẩn, Vinh', 'Cháo', 1, '30.000 – 60.000 ₫', 4.4, 1520,
    18.6725, 105.7141, '1482049016688-2d3e1b311543', ['Cháo lươn', 'Nghệ', 'Ăn sáng'],
    'Cháo lươn nấu nhừ, thịt lươn dai, nêm gia vị vừa và rắc hành lá thơm. Bữa sáng quen thuộc của người xứ Nghệ.',
    ['Cháo lươn', 'Cháo gà', 'Quẩy'], '05:00 – 13:00', ['Sĩ Nam', 4, '1 tháng trước', 'Cháo mịn, lươn tươi, ăn nóng rất ấm bụng.'])
];

if (typeof window !== 'undefined') {
  window.FOOD_DATA = { CURATED_PLACES, CITY_CENTERS, CUISINE_EMOJI };
}
