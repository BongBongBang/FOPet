//输入提示语
const placeOrder = {
  placeholder: {
    contact: '姓名',
    contactPhone: '手机号码',
    emContact: '姓名',
    emContactPhone: '手机号码',
    description: '为主子嘱咐两句...'
  }
};

//校验语
const verify = {
  isEmpty: [
    'warning:您还没有选择任何服务',
    'warning:联系人不能为空',
    'warning:联系方式不能为空',
    'warning:必须同意《寄养服务协议》才能进行寄养'
  ],
  exceed: [
    'warning:请选择合理的时间范围'
  ]
};

//寄养服务协议内容
const agreement = '寄养须知：\n' +
  '\n' +
  '一、宠物主人权利义务：\n' +
  '\n' +
  '1.寄养宠物需提供：正规免疫证、狂犬证明。\n' +
  '※ 提醒您，免疫注射七天后才生效。\n' +
  '1）建议您寄养宠物宠龄为：6个月~8岁（含8岁），8岁以上请酌情考虑。\n' +
  '2）一岁龄以内的宠物要做过基础免疫，即三针宠物联苗和狂犬疫苗。\n' +
  '3）怀孕期间，或者近期做过手术，不建议寄养。\n' +
  '4）未生病、无隐性疾病，且半年内没有犬瘟、细小、冠状等致命传染性疾病发病史的犬类。半年内没有猫瘟等致命性传染性疾病的猫类。\n' +
  '5）发情期或邻近发情期宠物，请宠物主人酌情寄养，并准备防护措施。\n' +
  '2.寄养期间宠物主人需提供宠物用品：粮食、牵引绳、窝垫等。\n' +
  '3.须保证所寄养宠物身体健康，体温正常，吃喝正常，不携带任何传染性或行动不便等疾病。\n' +
  '4.宠物主人应向寄养家庭提供宠物的生活习性、饮食习惯、作息时间等真实情况。\n' +
  '5.所寄养的宠物如具有一定的攻击性请务必提前向寄养家庭说明（或寄养家庭现场咨询），避免产生纠纷。\n' +
  '二、寄养家庭权利义务：\n' +
  '\n' +
  '1.寄养家庭有权对不符合要求的宠物拒绝寄养。\n' +
  '2.寄养家庭尊重宠物主人的饲喂习惯，为寄养的宠物提供合理的饮食、住所及日常照顾，如有变更或调整需征得宠物主人的同意。\n' +
  '3.寄养家庭应排除一切寄养环境中可能危害寄养宠物健康和安全的隐患。包括：垃圾桶、袜子、地垫、拖鞋、贵重物品等，同时防止个别宠物可能因为不适应新环境而对寄养家庭家中物品造成破坏。\n' +
  '4.不得让宠物生活在潮湿阴暗的角落而引发皮肤病。需及时隔离其他患病宠物而传染疾病。需及时制止宠物打架而避免造成宠物伤亡。\n' +
  '5.当宠物在寄养的过程中出现厌食、情绪异常、呕吐、拉稀等任何疾病征兆，寄养家庭必须在3小时内告知宠物主人，在取得宠物主人同意后，采取必要的医疗措施，并在24小时内通知宠音平台。\n' +
  '6.在寄养过程中出现发情，寄养家庭应采取相对措施（关闭门窗、隔离、穿戴安全裤等）并通知主人。如寄养猫咪，请务必关好门窗。\n' +
  '7.如遇到重大事故，宠音平台有权对寄养家庭做下架或冻结寄养费处理。\n' +
  '双方责任条款：\n' +
  '\n' +
  '1.当发生以下情况时，寄养家庭有权中止寄养，并由双方协商解决方案：\n' +
  '1）当寄养的宠物有明显的攻击性，会对寄养家庭及其宠物造成伤害的。\n' +
  '2）当寄养宠物有很强的破坏性，对寄养家庭的不可收纳物件造成持续破坏的。\n' +
  '3）当寄养的宠物被发现有疾病隐患且宠物主人在寄养前没有告知的。\n' +
  '2.寄养结束时，宠物主人应按时接回宠物。如主人不能到场应电话委托代理人，凭本人证件原件接回宠物。\n' +
  '1)如寄养结束宠物主人暂时无法及时接回宠物，经双方沟通可继续接受寄养，宠物主人需立即在宠音再次下单。\n' +
  '3. 寄养订单结束超 7 日如出现以下几种情形则视为宠物主人弃养。\n' +
  '1）宠物主人逾期未缴纳寄养费用，且寄养家庭无法与宠物主人取得联系。\n' +
  '2）宠物主人明确拒绝领回寄养宠物。\n' +
  '4. 若因寄养家庭外出未使用牵引绳或看管不善而造成宠物丢失、意外伤亡等情况，寄养家庭负全责。宠物主人与寄养家庭协商赔偿处理，与宠音平台无关。\n' +
  '5. 当在寄养过程中产生任何争议，寄养家庭和宠物主人基于对“宠音” 的信任，愿意接受宠音客服中心的调解和处理办法。\n' +
  '6.宠物主人确认订单，即表示认可寄养家庭的服务方式和养宠经验，并信任寄养家庭会根据宠物主人的要求照顾宠物。\n' +
  '7. 若宠物在寄养期间因寄养家庭照顾不当导致寄养宠物吞食异物而对宠物造成伤害的，由寄养家庭负全责。\n' +
  '8.宠物在寄养期间，寄养家庭应妥善保管家中物品，以防止个别宠物可能因为不适应新环境而对寄养家庭中的物品造成破坏。\n' +
  '1）寄养宠物对可收纳物品造成破坏而产生的经济损失，由寄养家庭承担，或双方协调解决。\n' +
  '2）寄养宠物对非平台保障范围内的不可收纳物品造成破坏而产生的经济损失，由宠物主人承担，或双方协调解决。\n' +
  '3）可收纳物品包括但不限于：耳机、遥控器、手机等。\n' +
  '9.寄养期间需要按照宠物主人的要求喂食和照顾。\n' +
  '1）不得擅自喂食人类食物（包括但不限于巧克力、葡萄、洋葱、牛奶、禽类骨头等等）。\n' +
  '2）不能让宠物生活在潮湿阴暗的角落而引发皮肤病；\n' +
  '3）需要离其他患病宠物，避免寄养宠物传染疾病；\n' +
  '4）需要制止宠物打架，避免死伤。\n' +
  '10.根据地方养犬办规定，凡不符合养犬办规定犬只，如遇到限养、禁养犬只被没收，本平台不承担任何责任。\n' +
  '以上因寄养家庭过失而造成的对宠物的伤害由寄养家庭负责。';

//其他服务周期时间
const durationOtherTime = 1;

/**
 * 订单信息配置
 * @type {({})[]}
 */
const orderInfo = [{
  id: 'fosterPetNum',
  name: '宠物数量'
}, {
  id: 'timeDesc',
  name: '寄养时间'
}, {
  id: 'orderNo',
  name: '订单编号'
}, {
  id: 'orderTimeDesc',
  name: '下单时间'
}, {
  id: 'paymentTimeDesc',
  name: '支付时间',
  value: '尚未支付'
}];

export {
  placeOrder,
  verify,
  agreement,
  durationOtherTime,
  orderInfo
};
