import { RefObject, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { useAppSelector } from "../../store";
import { closeBoostBuyPopup } from "../../store/reducers/boost";
import { closeCoinBuyPopup } from "../../store/reducers/coin";

import { useOutsideClick } from "../../hooks/useOutsideClick";
import useClosePopupByTgButton from "../../hooks/useClosePopupByTgButton";

import classNames from "classnames/bind";
import useWindowSize from "../../hooks/useWindowSize";
const cn = classNames.bind(styles);

import Coins from "./modules/Coins";
import Liga from "./modules/Liga";
import styles from "./Home.module.scss";
import Energy from "./modules/Energy";
import Menu from "./modules/Menu";
import FarmBloks from "./modules/FarmBlocks/FarmBloks";
import Popup from "../../components/Popup/Popup";
import Button from "../../components/Button/Button";
import CoinWhiteBg from "../../components/CoinWhiteBg/CoinWhiteBg";
import PopupListWrap from "../../components/PopupList/modules/PopupListWrap";
import PopupListTabs from "../../components/PopupList/modules/PopupListTabs";
import PopupList from "../../components/PopupList/PopupList";
import BoostBlock from "../../components/BoostBlock/BoostBlock";
import CoinBlock from "../../components/CoinBlock/CoinBlock";
import Boosts from "./modules/Boosts/Boosts";
import Account from "./modules/Account";
import LigaBlock from "../../components/LigaBlock/LigaBlock";
import Greeting from "../../components/Greeting/Greeting";
import FreindOrSpecialBlock from "../../components/FreindOrSpecialBlock/FreindOrSpecialBlock";

const Home = () => {
   const dispatch = useDispatch();
   const { width } = useWindowSize();

   const isLoading = useAppSelector((state) => state.preloader.isLodaing);

   // Energy popup
   const [energyPopupOpen, setEnergyPopupOpen] = useState(false);
   const energyRef = useOutsideClick(
      () => setEnergyPopupOpen(false),
      ["#energy"]
   );
   const energyMoneyAnimRef = useRef<HTMLImageElement>(null);

   // Buy Boost popup
   const boostState = useAppSelector((state) => state.boost);
   const boostBuyRef = useOutsideClick(
      () => dispatch(closeBoostBuyPopup()),
      ["#buyBoost"]
   );

   // Boost popup
   const [boostPopupOpen, setBoostPopupOpen] = useState(false);
   const boostRef = useOutsideClick(
      () => setBoostPopupOpen(false),
      ["#menu", "#tabs", "#popup"]
   );
   useClosePopupByTgButton({
      isOpen: boostPopupOpen,
      closePopup: () => setBoostPopupOpen(false),
   });
   const boostMoneyAnimRef = useRef<HTMLImageElement>(null);
   // Активный таб в boost popup
   const [boostActiveTab, setBoostActiveTab] = useState("BOOST");

   // Earn popup
   const [earnPopupOpen, setEarnPopupOpen] = useState(false);
   const earnRef = useOutsideClick(
      () => setEarnPopupOpen(false),
      ["#menu", "#tabs", "#popup"]
   );
   useClosePopupByTgButton({
      isOpen: earnPopupOpen,
      closePopup: () => setEarnPopupOpen(false),
   });

   // Активный таб в boost popup
   const [earnActiveTab, setEarnActiveTab] = useState("LEAGUES");

   // buyCoin popup
   const coinState = useAppSelector((state) => state.coin);
   const coinMoneyAnimRef = useRef<HTMLImageElement>(null);
   const coinBuyRef = useOutsideClick(
      () => dispatch(closeCoinBuyPopup()),
      ["#buyCoin"]
   );

   // Liga popup
   // const [ligaPopupOpen, setLigaPopupOpen] = useState(false);
   // const ligaRef = useOutsideClick(
   //    () => setLigaPopupOpen(false),
   //    ["#league", "#popup"]
   // );
   // useClosePopupByTgButton({
   //    isOpen: ligaPopupOpen,
   //    closePopup: () => setLigaPopupOpen(false),
   // });

   // True если хотя бы один попап открыт
   // но кроме попапа Energy!
   const isPopupOpen = boostPopupOpen || earnPopupOpen;

   // Осуществляет покупку в попапе и делает анимацию монет
   function buy(ref: RefObject<HTMLImageElement>, callback: () => void) {
      ref.current?.classList.add("moneyAnim");

      setTimeout(() => {
         ref.current?.classList.remove("moneyAnim");
         callback();
      }, 500);
   }

   return (
      <div className={cn("wrap", isLoading && "_hidden")}>
         <div className={cn("top")}>
            <Account
               nickname="dimamrkv"
               imgSrc={"img/pages/people/person.png"}
            />
            <Coins quantity={"349.917"} />
         </div>

         {!isPopupOpen && (
            <div className={cn("bottom")}>
               {/* Лига */}
               <Liga liga="Diamond" onLigaOpen={() => setEarnPopupOpen(true)} />
               <Energy
                  total={1000}
                  current={300}
                  onClick={() => setEnergyPopupOpen(true)}
               />
               <Menu
                  onBoostOpen={() => setBoostPopupOpen(true)}
                  onEarnOpen={() => setEarnPopupOpen(true)}
               />
            </div>
         )}

         {/* Элементы фона */}
         <div className={cn("bg-elements")}>
            <img src="img/pages/home/home-bg.svg" alt="road" />

            {/* Блоки земли */}
            <FarmBloks />

            {/* Активные boosts */}
            <Boosts />
         </div>

         {/* Energy popup */}
         <Popup
            borderlabel="Energy"
            isOpen={energyPopupOpen}
            onClose={() => setEnergyPopupOpen(false)}
            ref={energyRef}>
            <div className={cn("popup__body")}>
               {/* Молнии на заднем фоне */}
               <div className={cn("popup__bg-lightnings")}>
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
               </div>

               {/* Главная иконка молнии */}
               <img
                  src="img/pages/home/energy/energy.svg"
                  className={cn("popup__icon")}
                  alt="energy"
               />

               <span className={cn("popup__level")}>Level 7</span>

               <div className={cn("popup__bottom")}>
                  <div className={cn("popup__earning")}>
                     <span>+500/h</span>
                     <img src="img/pages/home/energy/energy.svg" alt="energy" />
                  </div>

                  <Button
                     className={cn("popup__btn")}
                     size={width > 380 ? "big" : "normal"}
                     onClick={() =>
                        buy(energyMoneyAnimRef, () => setEnergyPopupOpen(false))
                     }>
                     <CoinWhiteBg
                        iconName="BTC"
                        size={width > 380 ? "normall" : "small"}
                     />
                     <span>10 000</span>
                  </Button>
                  <img
                     src="img/pages/home/money.svg"
                     className={cn("popup__money-anim")}
                     ref={energyMoneyAnimRef}
                  />
               </div>
            </div>
         </Popup>

         {/* Boost popup */}
         <Popup
            borderlabel={boostState.info.name}
            isOpen={boostState.isOpen}
            onClose={() => dispatch(closeBoostBuyPopup())}
            ref={boostBuyRef}>
            <div className={cn("popup__body")}>
               <div className={cn("popup__bg-lightnings")}>
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
               </div>

               <img
                  src={boostState.info.imgSrc}
                  className={cn("popup__icon", "_boost")}
               />

               <div className={cn("popup__bottom")}>
                  <div className={cn("popup__earning")}>
                     <span>+{boostState.info.earning}/h</span>
                     <img src="img/pages/home/energy/energy.svg" alt="energy" />
                  </div>

                  <Button
                     className={cn("popup__btn")}
                     size={width > 380 ? "big" : "normal"}
                     onClick={() =>
                        buy(boostMoneyAnimRef, () =>
                           dispatch(closeBoostBuyPopup())
                        )
                     }>
                     <CoinWhiteBg
                        iconName="BTC"
                        size={width > 380 ? "normall" : "small"}
                     />
                     <span>{boostState.info.price}</span>
                  </Button>
                  <img
                     src="img/pages/home/money.svg"
                     className={cn("popup__money-anim")}
                     ref={boostMoneyAnimRef}
                  />
               </div>
            </div>
         </Popup>

         {/* Coin popup */}
         <Popup
            borderlabel={coinState.info.name}
            isOpen={coinState.isOpen}
            onClose={() => dispatch(closeCoinBuyPopup())}
            ref={coinBuyRef}>
            <div className={cn("popup__body")}>
               <div className={cn("popup__bg-lightnings")}>
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
                  <img src="img/global/lightning.svg" alt="energy" />
               </div>

               <CoinWhiteBg
                  className={cn("popup__icon", "_coin")}
                  iconName={coinState.info.name}
               />

               <div className={cn("popup__bottom")}>
                  <div className={cn("popup__earning")}>
                     <span>+{coinState.info.earning}/h</span>
                     <img src="img/pages/home/energy/energy.svg" alt="energy" />
                  </div>

                  <Button
                     className={cn("popup__btn")}
                     size={width > 380 ? "big" : "normal"}
                     onClick={() =>
                        buy(coinMoneyAnimRef, () =>
                           dispatch(closeCoinBuyPopup())
                        )
                     }>
                     <CoinWhiteBg
                        iconName="BTC"
                        size={width > 380 ? "normall" : "small"}
                     />
                     <span>{coinState.info.price}</span>
                  </Button>
                  <img
                     src="img/pages/home/money.svg"
                     className={cn("popup__money-anim")}
                     ref={coinMoneyAnimRef}
                  />
               </div>
            </div>
         </Popup>

         {/* BOOST popup */}
         <PopupListWrap isOpen={boostPopupOpen}>
            <PopupListTabs
               labels={["BOOST", "COINS"]}
               activeTab={boostActiveTab}
               onTabChange={(label) => setBoostActiveTab(label)}
            />
            {boostActiveTab === "BOOST" ? (
               <PopupList
                  ref={boostRef}
                  nodes={[
                     <BoostBlock
                        boostName="mill"
                        earning={"500"}
                        price="10 000"
                        ligaName="Wooden"
                     />,
                     <BoostBlock
                        boostName="drone"
                        earning={"500"}
                        price="15 000"
                        ligaName="Silver"
                        isBought
                     />,
                     <BoostBlock
                        boostName="minicar"
                        earning={"500"}
                        price="30 000"
                        ligaName="Gold"
                        isBlocked
                     />,
                     <BoostBlock
                        boostName="car-2"
                        earning={"500"}
                        price="40 000"
                        ligaName="Fire"
                        isBlocked
                     />,
                     <BoostBlock
                        boostName="car-3"
                        earning={"500"}
                        price="70 000"
                        ligaName="Diamond"
                        isBlocked
                     />,
                  ]}
               />
            ) : (
               <PopupList
                  ref={boostRef}
                  nodes={[
                     <CoinBlock
                        coinName="BTC"
                        earning="200"
                        price="10 000"
                        isBought
                        isActive
                     />,
                     <CoinBlock
                        coinName="Polkadot"
                        earning="500"
                        price="15 000"
                        isBought
                     />,
                     <CoinBlock
                        coinName="TON"
                        earning="700"
                        price="20 000"
                        isBlocked
                     />,
                     <CoinBlock
                        coinName="Binance"
                        earning="1 000"
                        price="30 000"
                     />,
                     <CoinBlock
                        coinName="Polkadot"
                        earning="2 000"
                        price="35 000"
                     />,
                     <CoinBlock
                        coinName="Solana"
                        earning="5 000"
                        price="50 000"
                     />,
                     <CoinBlock
                        coinName="ETHerium"
                        earning="10 000"
                        price="40 000"
                     />,
                     <CoinBlock
                        coinName="XRP"
                        earning="20 000"
                        price="80 000"
                     />,
                  ]}
               />
            )}
         </PopupListWrap>

         {/* EARN popup */}
         <PopupListWrap isOpen={earnPopupOpen}>
            <PopupListTabs
               labelClassName={cn("earn__label")}
               labels={["SPECIAL", "LEAGUES", "FRIENDS TASKS"]}
               activeTab={earnActiveTab}
               onTabChange={(label) => setEarnActiveTab(label)}
            />

            {earnActiveTab === "LEAGUES" && (
               <PopupList
                  ref={earnRef}
                  nodes={[
                     <LigaBlock
                        ligaName="Wooden"
                        percent={100}
                        price="5 000"
                        acitve={true}
                     />,
                     <LigaBlock
                        ligaName="Silver"
                        percent={0}
                        price="25 000"
                        acitve={false}
                     />,
                     <LigaBlock
                        ligaName="Gold"
                        percent={20}
                        price="100 000"
                        acitve={false}
                     />,
                     <LigaBlock
                        ligaName="Fire"
                        percent={10}
                        price="1 000 000"
                        acitve={false}
                     />,
                     <LigaBlock
                        ligaName="Diamond"
                        percent={5}
                        price="2 500 000"
                        acitve={false}
                     />,
                  ]}
               />
            )}

            {earnActiveTab === "SPECIAL" && (
               <PopupList
                  ref={earnRef}
                  nodes={[
                     <FreindOrSpecialBlock
                        imgSrc="img/social/tg.svg"
                        title="JOIN GROUP"
                        earning="20 000"
                        link="/"
                     />,
                     <FreindOrSpecialBlock
                        imgSrc="img/social/tg.svg"
                        title="JOIN CHAT"
                        earning="20 000"
                        link="/"
                     />,
                     <FreindOrSpecialBlock
                        imgSrc="img/social/X.svg"
                        title="JOIN X"
                        earning="20 000"
                        link="/"
                     />,
                  ]}
               />
            )}

            {earnActiveTab === "FRIENDS TASKS" && (
               <PopupList
                  ref={earnRef}
                  nodes={[
                     <FreindOrSpecialBlock
                        imgSrc="img/global/person-btn.svg"
                        title="1 FREIND"
                        earning="20 000"
                        link="/"
                     />,
                     <FreindOrSpecialBlock
                        imgSrc="img/global/person-btn.svg"
                        title="5 friends"
                        earning="20 000"
                        link="/"
                     />,
                     <FreindOrSpecialBlock
                        imgSrc="img/global/person-btn.svg"
                        title="25 friends"
                        earning="20 000"
                        link="/"
                     />,
                     <FreindOrSpecialBlock
                        imgSrc="img/global/person-btn.svg"
                        title="50 friends"
                        earning="20 000"
                        link="/"
                     />,
                     <FreindOrSpecialBlock
                        imgSrc="img/global/person-btn.svg"
                        title="100 friends"
                        earning="20 000"
                        link="/"
                     />,
                  ]}
               />
            )}
         </PopupListWrap>

         {/* Приветствие */}
         <Greeting />
      </div>
   );
};

export default Home;
