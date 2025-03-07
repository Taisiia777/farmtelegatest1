import { RefObject, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux";
import { setUser } from "../../store/reducers/userSlice";
import { RootState } from "../../store";
import { useAppSelector } from "../../store";
import { closeBoostBuyPopup } from "../../store/reducers/boost";
import { closeCoinBuyPopup } from "../../store/reducers/coin";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import useClosePopupByTgButton from "../../hooks/useClosePopupByTgButton";
import { retrieveLaunchParams } from '@tma.js/sdk';
import { calculateGrassEarnings, growAllToMax, } from "../../store/reducers/growthStages";
import axios from "axios";
import classNames from "classnames/bind";
import useWindowSize from "../../hooks/useWindowSize";
import { setUserCoins1 } from '../../store/reducers/userCoinsSlice';
import RainAnimation from './modules/RainAnimation';
import QRCodeComponent from './QRCodeComponent';
import { openGuide } from "../../store/reducers/guide";
// import useWheatTrunctaion from "./hooks/useWheatTrunctation";
// import {useHarvestAllWheat} from "./hooks/useHarvestAllWheat";
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';
// import Clouds from "./modules/Clouds";
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
import FreindOrSpecialBlock from "../../components/FreindOrSpecialBlock/FreindOrSpecialBlock";
import Greeting from "../../components/Greeting/Greeting";
import Guide from "../../components/Guide/Guide";
import Guide1 from "../../components/Guide1/Guide1";

import DailyBonus from "../../components/DailyBonus/DailyBonus";
// import { set } from "lodash";

type TLiga = "Wooden" | "Silver" | "Gold" | "Fire" | "Diamond" ; // Определение типа TLiga
type TBoostName = 'mill' | 'drone' | 'minicar' | 'car-2' | 'car-3';
type TGrowthStage = "first" | "second" | "third" | "fourth";

type TCoin =
   | "Bitcoin"
   | "Ethereum"
   | "BNB"
   | "Cardano"
   | "Solana"
   | "Ripple"
   | "Polkadot"
   | "Ton";

interface Task {
    id: number;
    description: string;
    type: string;
    rewardAmount: number;
    imgSrc: string;
    link: string;
  }

  
interface Booster {
   id: number;
   name: TBoostName;
   cost: number;
   yieldIncrease: number;
   league: string;
 }

 interface Coin {
   id: number;
   name: TCoin;
   cost: number;
   hourlyIncome: number;
 }

 type Reward = {
   id: number;
   description: string;
   type: string;
   amount: number;
   level: number | null;
   coins: number | null;
 };
 


// const leagues = [
//    { name: "Wooden", coinsRequired: 50000, coinsTo: 0 },
//    { name: "Silver", coinsRequired: 500000,  coinsTo: 50000  },
//    { name: "Gold", coinsRequired: 5000000, coinsTo: 500000  },
//    { name: "Fire", coinsRequired: 10000000, coinsTo: 5000000  },
//    { name: "Diamond", coinsRequired: 10000000, coinsTo: 10000000  },
//  ];

 const leagues = [
  { name: "Wooden", referralsRequired: 3, referralsTo: 0, harvest: 1 },
  { name: "Silver", referralsRequired: 10, referralsTo: 3, harvest: 1.5 },
  { name: "Gold", referralsRequired: 50, referralsTo: 10, harvest: 2 },
  { name: "Fire", referralsRequired: 200, referralsTo: 50, harvest: 3 },
  { name: "Diamond", referralsRequired: 1000, referralsTo: 200, harvest: 4 },
  { name: "Ruby", referralsRequired: 1001, referralsTo: 1000, harvest: 5 },
];


const Home = () => {
  const navigate = useNavigate();

   const dispatch = useDispatch();
   const { width } = useWindowSize();
    const user = useAppSelector((state: RootState) => state.user.user);
   const blocks = useAppSelector((state: RootState) => state.growthStages.blocks);
   const [nickname, setNickname] = useState('Savelii777'); // Состояние для никнейма
   // const [imgSrc, setImgSrc] = useState("img/pages/people/person.png");
   const [localCoins, setLocalCoins] = useState(user ? user.coins : 0);
   const [level, setLevel] = useState(user ? user.level : 0);
   const [progressPercent, setProgressPercent] = useState(0);
   const [isProgressUpdating, setIsProgressUpdating] = useState(false);
   const [boosters, setBoosters] = useState<Booster[]>([]);
   const [userBoosters, setUserBoosters] = useState<Booster[]>([]);
   const [coins, setCoins] = useState<Coin[]>([]);
   const [userCoins, setUserCoins] = useState<Coin[]>([]);
   const [hasFirstReward, setHasFirstReward] = useState(true); // Состояние для проверки наличия награды "first"
   const [grassTotal, setGrassTotal] = useState(0);
   const [rewards, setRewards] = useState<Reward[]>([]);
   const [isRain, setIsRain] = useState(true); // Состояние для проверки наличия награды "first"
   const [multiplier, setMultiplier] = useState(0); // Состояние для проверки наличия награды "first"
   const [mostExpensiveCoinName, setMostExpensiveCoinName] = useState<string | null>(null);
   let initialGrassEarnings = calculateGrassEarnings(blocks, user?.coinsPerHour, user?.incomeMultiplier);
   const [currentGrassEarnings, setCurrentGrassEarnings] = useState(initialGrassEarnings);
   const [displayEarnings, setDisplayEarnings] = useState(0);
   const [userXp, setUserXp] = useState(0); // Состояние для проверки наличия награды "first"
   const [isXpFetched, setIsXpFetched] = useState(false);
   const [isRainAnim, setIsRainAnim] = useState(false);
   const [currentRainProgress, setCurrentRainProgress] = useState(0);
   const [isFetchedRewards, setIsFetchedRewards] = useState(false);
   const [isFetchedRewards1, setIsFetchedRewards1] = useState(false);
   const [tasks, setTasks] = useState<Task[]>([]);
   const [rainInterval, setRainInterval] = useState(0);
   const lastUpdateRef = useRef(Date.now());
   const [showQRCode, setShowQRCode] = useState(false);
   const [showGuide, setShowGuide] = useState(false);

  // useWheatTrunctaion();
  // useHarvestAllWheat()
  console.log(mostExpensiveCoinName)
   console.log(rewards)
   console.log(currentGrassEarnings)
   console.log(userXp)
   // Состояние прелоудера
   const isLoading = useAppSelector((state) => state.preloader.isLodaing);

   // Состояние попапов приветсвия
  //  const isGreetingOpen = useAppSelector((state) => state.greeting.isOpen);

  //  // Состояние попапа бонуса
  //  const isDailyBonusOpen = useAppSelector((state) => state.dailyBonus.isOpen);

  //  const isFingerActve = useAppSelector(
  //     (state) => state.growthStages.isFingerActive
  //  );

   // Energy popup
   const [energyPopupOpen, setEnergyPopupOpen] = useState(false);
   const energyRef = useOutsideClick(
      () => setEnergyPopupOpen(false),
      ["#energy"]
   );
   const energyMoneyAnimRef = useRef<HTMLImageElement>(null);
   console.log(energyMoneyAnimRef)
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
      ["#menu", "#tabs", "#popup", "#energy"]
   );
   useClosePopupByTgButton({
      isOpen: boostPopupOpen,
      closePopup: () => setBoostPopupOpen(false),
   });
   const boostMoneyAnimRef = useRef<HTMLImageElement>(null);
   // Активный таб в boost popup
   const [boostActiveTab, setBoostActiveTab] = useState("BOOST");

   const openCoinPopup =  () => {
    setBoostActiveTab("COINS")
  };
  const openBoostPopup =  () => {
    setBoostActiveTab("BOOST")
  };
  const openLeaguePopup =  () => {
    setBoostActiveTab("LEAGUES")
  };
  const openSpecialPopup =  () => {
    setEarnActiveTab("TASKS")
  };
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

   // True если хотя бы один попап открыт
   // но кроме попапа Energy!
   const isPopupOpen = boostPopupOpen || earnPopupOpen;

   // Показываем палец подсказку только когда попапы приветсвия и бонуса прошли.
   // А также только когда первый раз собирает
  //  const canShowFinger = !isGreetingOpen && !isDailyBonusOpen && isFingerActve;
  const [canShowFinger, setCanShowFinger] = useState(true);

   // Осуществляет покупку в попапе и делает анимацию монет
   function buy(ref: RefObject<HTMLImageElement>, callback: () => void) {

      ref.current?.classList.add("moneyAnim");

      setTimeout(() => {
         ref.current?.classList.remove("moneyAnim");
         callback();
      }, 500);
   }

   useEffect(() => {
    const checkIfDesktop = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setShowQRCode(!isMobile);
    };
  
    checkIfDesktop();
  }, []);
  

   const fetchUserReferralsCount = async (userId: number) => {
    try {
      const response = await fetch(`https://coinfarm.club/api/user/${userId}/referrals`);
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return 0;
    }
  };

  const { t } = useTranslation();
  useEffect(() => {
    
    const initData = window.Telegram.WebApp.initDataUnsafe;
    const userLanguage = initData.user?.language_code || 'en'; // Получаем язык пользователя
    
    if (['en', 'ru', 'uk'].includes(userLanguage)) { // Добавьте другие поддерживаемые языки
      i18n.changeLanguage(userLanguage);
    } else {
      i18n.changeLanguage('en'); // Язык по умолчанию, если язык пользователя не поддерживается
    }
    // if (userLanguage !== 'en') {
    //   document.body.style.fontSize = '0.6em';
    // } else {
    //   document.body.style.fontSize = '1em';
    // }
     if (userLanguage !== 'en') {
   
    document.querySelectorAll('.textMenu').forEach(element => {
      if (element instanceof HTMLElement) { // Проверяем, что элемент является HTMLElement
        element.style.fontSize = '14px';
        element.style.fontWeight = '700';
      }
    });
    document.querySelectorAll('.textMenu1').forEach(element => {
       if (element instanceof HTMLElement) { // Проверяем, что элемент является HTMLElement
         element.style.fontSize = '13px';
         element.style.fontWeight = '700';
       }
     });
     document.querySelectorAll('.textRain').forEach(element => {
      if (element instanceof HTMLElement) { // Проверяем, что элемент является HTMLElement
        element.style.fontSize = '13px';
        element.style.fontWeight = '700';
      }
    });
    }
  }, []);

  
   useEffect(() => {
      const fetchData = async () => {
       
        const { initData } = retrieveLaunchParams(); // Предполагается, что у вас есть эта функция
        if (initData && initData.user) {
          const user = initData.user;
          // const username = user.username;
          let username = user.username || `guest_${user.id}`; // Используем guest_{user.id} если нет username

         const userId = user.id;

         const response = await axios.get(`https://coinfarm.club/api1/getReferralCode?user_id=${userId}`);
         const data = response.data;
         let referralCode = data.referral_code;
          if (username) {
            setNickname(username);
            
            try {
              const response = await axios.post(
                "https://coinfarm.club/api/user",
                {
                  username: username,
                  coins: 0,
                  totalEarnings: 0,
                  incomeMultiplier: 1,
                  coinsPerHour: 1000,
                  xp: 1000,
                  level: 0,
                  referralCode: referralCode,
                }
              );


              if (response.status === 409) {
                const userData =  response.data;
                alert(`User already exists: ${JSON.stringify(userData)}`);
                const userLeagueIndex = userData ? userData.level : 0;
                const userHarvestMultiplier = leagues[userLeagueIndex]?.harvest || 1;
                const calculatedInHour = userData?.coinsPerHour * userHarvestMultiplier;
                setGrassTotal(calculatedInHour);
                setLevel(userData.level);
                setMultiplier(userData.incomeMultiplier)
               
              }else {
                const newUser =  response.data;
                const userLeagueIndex = newUser ? newUser.level : 0;
                const userHarvestMultiplier = leagues[userLeagueIndex]?.harvest || 1;
                const calculatedInHour = newUser?.coinsPerHour * userHarvestMultiplier;
                setGrassTotal(calculatedInHour);
                setLevel(newUser.level);
                dispatch(setUser(newUser));
                setMultiplier(newUser.incomeMultiplier)                
              }
            } catch (error) {
              console.error("Error:", error);
            }
          }
  
          if (user.photoUrl) {
            // setImgSrc(user.photoUrl);
          } else {
          }
        }
      };
  
      fetchData(); // Initial fetch on component mount
  
      const interval = setInterval(fetchData, 2000); // Fetch every 2 seconds
      
      return () => clearInterval(interval); // Clean up interval on component unmount
  
    }, [dispatch]); // Add other dependencies if needed


    




    useEffect(() => {
      const updateOnlineStatus = async () => {
         let userId = user?.id
        try {
          await axios.post('https://coinfarm.club/api/user/online', { userId });
        } catch (error) {
          console.error('Error updating online status:', error);
        }
      };
  
     
  
      updateOnlineStatus();
      const intervalId = setInterval(() => {
        updateOnlineStatus();
      }, 10000); // Обновление каждые 60 секунд
  
      return () => clearInterval(intervalId);
    }, []);



  
   const updateLeagueProgress = async () => { 
      if (isProgressUpdating) return;
      setIsProgressUpdating(true);
      const userReferrals = await fetchUserReferralsCount(user.id);

      // Фиксируем текущий уровень лиги, чтобы не понижать
      let currentLevel = level;
    
      while (currentLevel < leagues.length) {
        const nextLeague = leagues[currentLevel];
        if (!nextLeague) break;
    
        // Обновляем прогресс для текущего уровня
        let percent;
        if (currentLevel < level) {
          // Если лига уже пройдена, устанавливаем прогресс на 100%
          percent = 100;
        } else {
          // Рассчитываем прогресс для текущей лиги
          percent = (userReferrals / nextLeague.referralsRequired) * 100;
        }
        setProgressPercent(Math.min(percent, 100));
    
        if (userReferrals >= nextLeague.referralsRequired && currentLevel != 5 ) {
          const newLevel = currentLevel + 1;
          const success = await updateUserLevel(user.id, newLevel, user?.incomeMultiplier * leagues[newLevel].harvest ); // Обновляем уровень на сервере
          if (success) {
            dispatch(setUser({ ...user, level: newLevel, incomeMultiplier: user?.incomeMultiplier}));
            currentLevel = newLevel; // Обновляем текущий уровень после успешного обновления
            setLevel(newLevel)
          } else {
            break; // Прерываем цикл если обновление не удалось
          }
        } else {
          break;
        }
      }
    
      setIsProgressUpdating(false);
    };
    
    const updateUserLevel = async (userId: number, newLevel: number, harvest: number) => {
      console.log(harvest)
      try {
        const response = await fetch(`https://coinfarm.club/api/user/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ level: newLevel }),
        });
        if (!response.ok) {
          throw new Error("Failed to update user level");
        }
        const updatedUser = await response.json();
        dispatch(setUser(updatedUser));
        return true;
      } catch (error) {
        console.error("Error updating user level:", error);
        return false;
      }
    };
    
    useEffect(() => {
      updateLeagueProgress();
    }, [localCoins]);
    
  



  
    useEffect(() => {
      if (user) {
        setLocalCoins(parseFloat(user.coins));
      }
    }, [user]);


  
    const renderLeagues = () => {
      return leagues.map((league, index) => {
        let percent;
        if (index < level) {
          percent = 100; // Прошедшие лиги имеют 100%
        } else if (index === level) {
          percent = (localCoins / league.referralsRequired) * 100; // Текущая лига рассчитывается
        } else {
          percent = 0; // Будущие лиги имеют 0%
        }
    
        const isActive = index <= level;
        console.log(progressPercent)
        return (
          <LigaBlock
            key={league.name}
            ligaName={league.name as TLiga} // Приведение типа к TLiga
            percent={percent}
            price={league.referralsTo.toString()}
            active={isActive}
            harvest={league.harvest}
          />
        );
      });
    };
 
    useEffect(() => {
      const fetchBoosters = async () => {
        try {
          const response = await fetch("https://coinfarm.club/api/booster");
          const data = await response.json();
          setBoosters(data);
        } catch (error) {
          console.error("Error fetching boosters:", error);
        }
      };
    
      const fetchUserBoosters = async () => {
        if (user) {
          try {
            const response = await fetch(`https://coinfarm.club/api/user/${user.id}/boosters`);
            const data = await response.json();
            setUserBoosters(data);
          } catch (error) {
            console.error("Error fetching user boosters:", error);
          }
        }
      };
      const fetchCoins = async () => {
         try {
           const response = await fetch("https://coinfarm.club/api/coin");
           const data = await response.json();
           setCoins(data);
         } catch (error) {
           console.error("Error fetching boosters:", error);
         }
       };
     
       const fetchUserCoins = async () => {
         if (user) {
           try {
             const response = await fetch(`https://coinfarm.club/api/user/${user.id}/coins`);
             const data = await response.json();
             setUserCoins(data);
             dispatch(setUserCoins1(data)); 
             const mostExpensiveCoin = data.reduce((max:any, coin:Coin) => coin.cost > max.cost ? coin : max, coins[0]);
     
             // Обновить состояние с именем самой дорогой монеты
             setMostExpensiveCoinName(mostExpensiveCoin.name);          

           } catch (error) {
             console.error("Error fetching user boosters:", error);
           }
         }
       };
     
       fetchCoins();
       fetchUserCoins();
      fetchBoosters();
      fetchUserBoosters();
    }, [user]);

    useEffect(() => {
      const fetchRewards = async () => {
         if (user?.id && !isFetchedRewards) {
            try {
               const response = await fetch(`https://coinfarm.club/api/reward/${user.id}`, {
                  method: 'GET',
                  headers: {
                     'Content-Type': 'application/json',
                     'Accept': 'application/json'
                  }
               });

               if (!response.ok) {
                  throw new Error('Something went wrong');
               } else {
                  const rewards = await response.json();
                  // dispatch(setUserRewards1(rewards));
                  const hasFirstReward = rewards.some((reward: any) => reward.type === 'first');
                  setIsFetchedRewards(true)
                  setHasFirstReward(hasFirstReward);
               }
            } catch (error) {
               console.error('Error:', error);
            }
         }
      };
   fetchRewards()
      
   }, [user]);
    const getActiveBoosterIds = (): number[] => {
      return boosters
        .filter(booster => {
          const isBought = userBoosters.some(userBooster => userBooster.id === booster.id);
          // const currentLeagueIndex = leagues.findIndex(league => league.name === leagues[level].name);
          // const boosterLeagueIndex = leagues.findIndex(league => league.name === booster.league);
          // const isBlocked = boosterLeagueIndex > currentLeagueIndex;
          const isBlocked = false;
          return isBought && !isBlocked;
        })
        .map(booster => booster.id);
    };


   async function applyBooster() {
      try {
        
          if (user) {
               const response = await axios.post(`https://coinfarm.club/api/booster/apply/${user.id}/${boostState.info.boosterId}`);
               console.log('Booster applied:', response.data);
         
          }
      } catch (error) {
        console.error('Error applying booster:', error);
      }
      
    }
    const boosterNames = [
      'Energy Mill',
      'Crop Master',
      'Robo Rover',
      'Harvester Pro',
      'Super Drone'
    ];
   const renderBoosters = () => {
    const sortedBoosters = boosters.sort((a, b) => a.id - b.id);

      return sortedBoosters.map((booster, index) => {
         
        // Проверка, куплен ли бустер пользователем
        const isBought = userBoosters.some((userBooster) => userBooster.id === booster.id);
        // Проверка, доступен ли бустер для текущей или предыдущих лиг
        // const currentLeagueIndex = leagues.findIndex((league) => league.name === leagues[level].name);
        // const boosterLeagueIndex = leagues.findIndex((league) => league.name === booster.league);
        // const isBlocked = boosterLeagueIndex > currentLeagueIndex;
        const isBlocked = false
        if(user){
         return (
            <BoostBlock
              key={booster.id}
              boostName={booster.name}
              boostNameNew={boosterNames[index]}
              earning={booster.yieldIncrease.toString()}
              price={booster.cost.toString()}
              ligaName={booster.league as TLiga}
              isBought={isBought}
              isBlocked={isBlocked}
              userCoins={user.coins} // Передача количества монет пользователя
              boosterId={booster.id} // Передача boosterId
            />
          );
        }else{
         return (
            <BoostBlock
              key={booster.id}
              boostName={booster.name}
              boostNameNew={boosterNames[index]}
              earning={booster.yieldIncrease.toString()}
              price={booster.cost.toString()}
              ligaName={booster.league as TLiga}
              isBought={isBought}
              isBlocked={isBlocked}
              userCoins={0} // Передача количества монет пользователя
              boosterId={booster.id} // Передача boosterId
            />
          );
        }
        
      });
    };
    






    
   async function giveCoin() {
      try {
        const response = await axios.post(`https://coinfarm.club/api/coin/give/${user.id}/${coinState.info.coinId}`);
        console.log('Coin given:', response.data);
      } catch (error) {
        console.error('Error giving coin:', error);
      }
    }
   const renderCoins = () => {
      const getMostExpensiveCoin = (userCoins: Coin[]) => {
         if (userCoins.length === 0) return null;
       
         return userCoins.reduce((maxCoin, currentCoin) => {
           return currentCoin.cost > maxCoin.cost ? currentCoin : maxCoin;
         });
       };
       const mostExpensiveCoin = getMostExpensiveCoin(userCoins);
       const sortedCoins = [...coins].sort((a, b) => a.id - b.id);
      return sortedCoins.map((coin, index) => {
        // Проверка, куплена ли монета пользователем
        const isBought = userCoins.some((userCoin) => userCoin.id === coin.id);
        const isActive =  mostExpensiveCoin ? mostExpensiveCoin.id === coin.id : false;
        const isBlocked = false; // Здесь можно добавить логику блокировки, если требуется
        const hourlyIncome = 1000 + index * 100;
       
        if(user){
        return (
          <CoinBlock
            key={coin.id}
            coinName={coin.name}
            earning={coin.hourlyIncome.toString()}
            price={coin.cost.toString()}
            isBought={isBought}
            isBlocked={isBlocked}
            userId={user.id} // Передача userId
            userCoins={user.coins} // Передача количества монет пользователя
            coinId={coin.id} // Передача coinId
            isActive={isActive}
            mostExpensiveCoinId = {mostExpensiveCoin?.id ? mostExpensiveCoin?.id : 2}
          />
        );
      }else{
         <CoinBlock
            key={coin.id}
            coinName={coin.name}
            earning={hourlyIncome.toString()}
            price={coin.cost.toString()}
            isBought={isBought}
            isBlocked={isBlocked}
            userId={user.id} // Передача userId
            userCoins={0} // Передача количества монет пользователя
            coinId={coin.id} // Передача coinId
            mostExpensiveCoinId = {mostExpensiveCoin?.id ? mostExpensiveCoin?.id : 2}
          />
      }
      });
    };
    const updateCoins = async (amount: number) => {
      if (user) {
        try {
          const response = await axios.patch(
            `https://coinfarm.club/api/user/${user.id}/earn/${amount}`
          );
          const updatedUser = response.data;
          // Обновление состояния пользователя
          dispatch(
            setUser({
              ...updatedUser,
              coins: parseFloat(updatedUser.coins),
              totalEarnings: parseFloat(updatedUser.totalEarnings),
            })
          );
    
          console.log("Coins updated successfully:", updatedUser); // Лог успешного обновления монет
        } catch (error) {
          console.error("Error updating user coins:", error);
        }
      } else {
        console.log("No user or amount is zero"); // Лог для отладки
      }
    };
    
    const getNonFirstStageCount = (blocks: { id: number; stage: TGrowthStage }[]) => {
      return blocks.filter(block => block.stage !== "first").length;
    };
    
    // useEffect(() => {
    //   const handleHarvest = (event: Event) => {
    //     const customEvent = event as CustomEvent<number>;
    //     const harvestedCount = customEvent.detail;
    
    //     // Получить количество блоков с несрезанными стадиями
    //     const nonFirstStageCount = getNonFirstStageCount(blocks);
    
    //     console.log("Non-first stage count:", nonFirstStageCount);
    //     console.log("Current grass earnings:", currentGrassEarnings);
    //     console.log("Harvested count:", harvestedCount);
    
    //     if (nonFirstStageCount > 0) {
    //       let totalDecrementAmount = 0;
    //       let newGrassEarnings = currentGrassEarnings;
    
    //       for (let i = 0; i < harvestedCount; i++) {
    //         const decrementAmount = newGrassEarnings / nonFirstStageCount;
    //         console.log("Decrement amount:", decrementAmount);
    
    //         totalDecrementAmount += decrementAmount;
    //         newGrassEarnings = Math.max(newGrassEarnings - decrementAmount, 0);
    //       }
    
    //       setCurrentGrassEarnings(newGrassEarnings);
    //       setDisplayEarnings(prev => {
    //         const newDecrementAmount = (prev / nonFirstStageCount) * harvestedCount;
    //         const newEarnings = Math.max(Math.round(prev - newDecrementAmount), 0);
    //         updateCoins(newDecrementAmount);  // Начислить монеты пользователю
    //         return newEarnings;
    //       });
    
    //       console.log("Final current grass earnings:", newGrassEarnings);
    //       console.log("Total decrement amount:", totalDecrementAmount);
    //     } else {
    //       // // Если все блоки имеют стадию "first", установим значения в ноль
    //       // setCurrentGrassEarnings(0);
    //       // setDisplayEarnings(0);
    //       setDisplayEarnings(prev => {
    //         const currentEarnings = prev;
    //         updateCoins(currentEarnings);  // Начислить текущее значение прогресбара пользователю
    //         setCurrentGrassEarnings(0);
    //         return 0;
    //       });
    //     }
    //   };
    
    //   document.addEventListener("harvest", handleHarvest);
    
    //   return () => {
    //     document.removeEventListener("harvest", handleHarvest);
    //   };
    // }, [blocks, currentGrassEarnings, user]);
    
    useEffect(() => {
      const handleHarvest = () => {
        // Когда происходит событие "harvest", очищаем таймер
        clearTimeout(timer);
      };
  
      // Запускаем таймер на 10 секунд при первой загрузке компонента
      const timer = setTimeout(() => {
        if(user?.totalEarnings <= 3000 && !showGuide){
          dispatch(openGuide());
          setShowGuide(true);
        }
    
      }, 10000); // 10 секунд бездействия
  
      // Добавляем обработчик события "harvest"
      document.addEventListener("harvest", handleHarvest);
  
      // Очищаем таймер и обработчик события при размонтировании компонента
      return () => {
        clearTimeout(timer);
        document.removeEventListener("harvest", handleHarvest);
      };
    }, []);
    
    useEffect(() => {
      const handleHarvest = (event: Event) => {
        const customEvent = event as CustomEvent<number>;
        const harvestedCount = customEvent.detail;
    
        // Получить количество блоков с несрезанными стадиями
        const nonFirstStageCount = getNonFirstStageCount(blocks);
    
        console.log("Non-first stage count:", nonFirstStageCount);
        console.log("Current grass earnings:", currentGrassEarnings);
        console.log("Harvested count:", harvestedCount);
        setCanShowFinger(false);
        if(user?.totalEarnings <= 3000 && !showGuide){
          dispatch(openGuide());
          setShowGuide(true);
        }

        if (nonFirstStageCount > 0) {
          let totalDecrementAmount = 0;
          let newGrassEarnings = currentGrassEarnings;
    
          for (let i = 0; i < harvestedCount; i++) {
            const decrementAmount = newGrassEarnings / nonFirstStageCount;
            console.log("Decrement amount:", decrementAmount);
    
            totalDecrementAmount += decrementAmount;
            newGrassEarnings = Math.max(newGrassEarnings - decrementAmount, 0);
          }
    
          setCurrentGrassEarnings(newGrassEarnings);
          setDisplayEarnings(prev => {
            let newDecrementAmount = 0;
            let newEarnings = prev;
            for (let i = 0; i < harvestedCount; i++) {
              const decrementAmount = newEarnings / nonFirstStageCount;
              newDecrementAmount += decrementAmount;
              newEarnings = Math.max(Math.round(newEarnings - decrementAmount), 0);
            }
            updateCoins(newDecrementAmount);  // Начислить монеты пользователю
            return newEarnings;
          });
    
          console.log("Final current grass earnings:", newGrassEarnings);
          console.log("Total decrement amount:", totalDecrementAmount);
          
        } else {
          // Если все блоки имеют стадию "first", начисляем текущее значение прогресбара пользователю и сбрасываем его в ноль
          setDisplayEarnings(prev => {
            const currentEarnings = prev;
            updateCoins(currentEarnings);  // Начислить текущее значение прогресбара пользователю
            setCurrentGrassEarnings(0);
            return 0;
          });
        }
      };
    
      document.addEventListener("harvest", handleHarvest);
    
      return () => {
        document.removeEventListener("harvest", handleHarvest);
      };
    }, [blocks, currentGrassEarnings, user]);
    
    
    
  

    
    const updateXP = async (amount: number) => {
      try {
        await axios.patch(`https://coinfarm.club/api/user/${user?.id}/xp/${amount}`);
      } catch (error) {
        console.error('Error updating XP:', error);
      }
    };
  
    // Этот useEffect устанавливает начальное значение displayEarnings из user.xp при первом рендере
    useEffect(() => {
      if (user?.xp && !isXpFetched) {
        setTimeout(() => {
          setDisplayEarnings(user.xp);
          setIsXpFetched(true);
        }, 100); // Задержка, имитирующая время отображения алерта
       
      }
    }, [blocks, navigate]);
  
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     setDisplayEarnings(prev => prev + (user?.coinsPerHour / 7200 || 0));
    //   }, 1000);
  
    //   return () => clearInterval(interval);
    // }, [user?.coinsPerHour]);
  
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     setDisplayEarnings(prevDisplayEarnings => {
    //       const earningsIncrement = user?.coinsPerHour / 7200 || 0;
    //       const newDisplayEarnings = prevDisplayEarnings + earningsIncrement;
    
    //       const maxEarnings = user?.coinsPerHour * user?.incomeMultiplier;
    
    //       if (newDisplayEarnings <= maxEarnings) {
    //         updateXP(newDisplayEarnings);
    //         setUserXp(newDisplayEarnings);
    //         return newDisplayEarnings;
    //       } else {
    //         updateXP(maxEarnings);
    //         setUserXp(maxEarnings);
    //         return maxEarnings;
    //       }
    //     });
    //   }, 1000);
    
    //   return () => clearInterval(interval);
    // }, [user?.coinsPerHour, user?.incomeMultiplier]);
    

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          lastUpdateRef.current = Date.now();
        }
      };
  
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastUpdateRef.current) / 1000; // время в секундах
        lastUpdateRef.current = now;
        const userLeagueIndex = user ? user.level : 0;
        const userHarvestMultiplier = leagues[userLeagueIndex]?.harvest || 1;
        const calculatedInHour = user?.coinsPerHour * userHarvestMultiplier;
        setDisplayEarnings(prevDisplayEarnings => {
          const earningsIncrement = (calculatedInHour / 3600 || 0) * elapsed;
          const newDisplayEarnings = prevDisplayEarnings + earningsIncrement;
          const maxEarnings = calculatedInHour * user?.incomeMultiplier;
  
          if (newDisplayEarnings <= maxEarnings) {
            updateXP(newDisplayEarnings);
            setUserXp(newDisplayEarnings);
            return newDisplayEarnings;
          } else {
            updateXP(maxEarnings);
            setUserXp(maxEarnings);
            return maxEarnings;
          }
        });
      }, 1000);
  
      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [user?.coinsPerHour, user?.incomeMultiplier]);
  
    useEffect(() => {
      if (user?.id && !isFetchedRewards1) {
        const fetchRewards = async () => {
    try {
      const response = await axios.get(`https://coinfarm.club/api/reward/${user?.id}`);
      setRewards(response.data);
      checkRainReward(response.data);
      console.log("check rain");
      setIsFetchedRewards1(true)
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

      fetchRewards();
}
    }, [user]); // Depend on location and user ID

    useEffect(() => {
      // if (energyPopupOpen) {
        // Step 1: Fetch rewards data
        axios.get(`https://coinfarm.club/api/reward/${user?.id}`)
          .then(response => {
            setRewards(response.data);
            checkRainReward(response.data);
            console.log("check rain")
          })
          .catch(error => {
            console.error('Error fetching rewards:', error);
          });
      // }
    }, [user]);

    
    const checkRainReward = (rewards: Reward[]) => {
      const rainRewards = rewards.filter(reward => reward.type === 'rain');
      const car2Boost = userBoosters.find(boost => boost.name === 'mill');
      setRainInterval(car2Boost ? 12 : 6); // Установите интервал на 12 часов, если бустер car-2 активен
    
      if (rainRewards.length > 0) {
        const latestRainReward = rainRewards[rainRewards.length - 1];
        const rewardTime = new Date(latestRainReward.description);
        const currentTime = new Date();
        const timeDifference = (currentTime.getTime() - rewardTime.getTime()) / (1000 * 60 * 60); // in hours
    
        // Устанавливаем прогресс до следующего дождя
        setCurrentRainProgress(timeDifference);
    
        // Шаг 3: Проверка разницы во времени
        if (timeDifference > rainInterval) {
          setIsRain(true);
        } else {
          setIsRain(false);
        }
      } else {
        setIsRain(true);
        setCurrentRainProgress(rainInterval); // Если нет наград за дождь, то дождь доступен
      }
    };
    

  
    const handleRainReward = async () => {
      try {
      //   const userId = 'yourUserId'; // Replace with actual user ID
        const response = await axios.post(`https://coinfarm.club/api/reward/rain/${user?.id}`);
         console.log(response)
         const userLeagueIndex = user ? user.level : 0;
         const userHarvestMultiplier = leagues[userLeagueIndex]?.harvest || 1;
         const calculatedInHour = user?.coinsPerHour * userHarvestMultiplier;
          setCurrentGrassEarnings(calculatedInHour*user?.incomeMultiplier);
          setDisplayEarnings(calculatedInHour*user?.incomeMultiplier);
          dispatch(growAllToMax());
          setEnergyPopupOpen(false);
          setIsRainAnim(true);
          setTimeout(() => setIsRainAnim(false), 5000);
        } catch (error) {
        console.error('Error sending rain reward request:', error);
      }
    };
    useEffect(() => {
      const fetchTasks = async () => {
        try {
          const response = await axios.get('https://coinfarm.club/api/reward/');
          setTasks(response.data);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
    
      fetchTasks();
    }, []);
    

   return (
      <>
       <QRCodeComponent />
       {!showQRCode && (
 <>

 {/* { isRain && <Clouds
 onClick={() => setEnergyPopupOpen(true)}
 />}

  { isRainAnim && <Clouds 
  onClick={() => setEnergyPopupOpen(true)}
  />} */}
          {isRainAnim && <RainAnimation />}
          {!energyPopupOpen && !isPopupOpen && <Energy 
            hours={user?.incomeMultiplier}
           total={rainInterval}
           current={currentRainProgress}
           onClick={() => setEnergyPopupOpen(true)}
           onClickProgresbar={() => console.log('kkk')}
           version={1}
           inHour={user?.coinsPerHour}
           isRain={!isRain}
           onClickProgresbarHarvest={
            () => {
              console.log('jjj')
            }
           }
          /> }
          
         {/* Основной контент */}
         <div className={cn("wrap", isLoading && "_hidden")}>
            <div className={cn("top")} style={{zIndex:'2'}}>
               <Account
                  // nickname="dimamrkv"
                  nickname={nickname.toUpperCase()}
                  // imgSrc={imgSrc}
                  />
               <Coins quantity={Math.round(user?.coins || 0).toString()} />
            </div>

            {!isPopupOpen && (
               <div className={cn("bottom")}>
                  {/* Лига */}
                  {/* <Liga
                     liga="Diamond"
                     onLigaOpen={() => setEarnPopupOpen(true)}
                  /> */}
                  <Liga onClick={() => {setBoostPopupOpen(true)
                    openLeaguePopup()
                  }} liga={leagues[level].name as TLiga} onLigaOpen={() => setEarnPopupOpen(true)} />
                  <Energy
                     total={grassTotal*multiplier}
                     hours={user?.incomeMultiplier}
                     current={displayEarnings<=grassTotal*multiplier? Math.round(displayEarnings) : grassTotal*multiplier}
                     onClickProgresbarHarvest={
                      () => {
                        setBoostPopupOpen(true);
                        openCoinPopup()
                      }
                     }
                     onClick={() => {
                      () => {
                        setBoostPopupOpen(true);
                        openBoostPopup()
                      }
                    }}
                    onClickProgresbar={
                      () => {
                        setBoostPopupOpen(true);
                        openBoostPopup()

                      }
                    }
                    inHour={user?.coinsPerHour}
                     version={0}
                     isRain={!isRain}

                  />
                  <Menu
                     onBoostOpen={() => {setBoostPopupOpen(true)
                      openBoostPopup()
                     }}
                     onEarnOpen={() => {setEarnPopupOpen(true)
                      openSpecialPopup()
                     }}
                     onCoinsOpen={() => {
                      setBoostPopupOpen(true)
                      openCoinPopup()}}
                  />
               </div>
            )}

            {/* Элементы фона */}
            <div className={cn("bg-elements")}>
               <img src="img/pages/home/bg-elements.svg" alt="road" />

               {/* Блоки земли */}
               {/* <FarmBloks /> */}
               <FarmBloks league={leagues[level].name as TLiga} />
               {/* Активные boosts */}
               <Boosts activeBoosterIds={getActiveBoosterIds()} />

               {/* Палец подсказка */}
               {canShowFinger && (
                  <div className={cn("finger")}>
                     <img src="img/pages/home/finger.svg" />
                  </div>
               )}
            </div>

            {/* Rain popup */}
            <Popup
      borderlabel={t('rain')}
      isBlueBg
      isOpen={energyPopupOpen}
      onClose={() => setEnergyPopupOpen(false)}
      ref={energyRef}
    >
      <div className={cn("popup__body")}>
        <div className={cn("popup__bg-drops")}>
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
          <img src="img/pages/home/energy/drop.svg" alt="drop" />
        </div>
          
        <img
          src="img/pages/home/energy/dark-clouds.svg"
          className={cn("popup__icon")}
          alt="energy"
        />

        <p className={cn("popup__desc") + " textShadow textRain"}>
          {/* Activate rain to instantly grow your crops to their maximum
          yield without waiting! Collect your fully grown harvest
          immediately! */}
          {t('rain_descr')}
        </p>

        <div className={cn("popup__bottom")}>
        {!isRain ? (
            <Button
            className={cn("popup__btn")}
            size={width > 380 ? "big" : "normal"}
            isBlueBg
            disabled
          >
           
            <span className="textShadow">{t('rain')}</span>
          </Button>
          ) : (
            <Button
            className={cn("popup__btn1")}
            size={width > 380 ? "big" : "normal"}
            onClick={handleRainReward}
          >
          
            <span className="textShadow">{t('rain')}</span>
          </Button>
          )}
         
        </div>
      </div>
    </Popup>

            {/* Boost popup */}
            <Popup
               borderlabel={t(`${boostState.info.boostNameNew.toLocaleLowerCase()}`)} // Используем новое имя бустера
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
                        <span>+{boostState.info.earning} {t('hour')} ⏰</span>
                       
                     </div>

                     <Button
                        className={cn("popup__btn")}
                        size={width > 380 ? "big" : "normal"}
                        onClick={() =>{
                           applyBooster()
                           buy(boostMoneyAnimRef, () =>
                              dispatch(closeBoostBuyPopup())
                           )
                        }
                           
                        }>
                        <CoinWhiteBg
                           iconName="Bitcoin"
                           size={width > 380 ? "normall" : "small"}
                        />
                        <span>{boostState.info.price}</span>
                     </Button>
                     <img
                        // src={`img/pages/home/${mostExpensiveCoinName}/money.svg`}
                        src={`img/pages/home/money1.svg`}
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
                        <span>+{coinState.info.earning} / 1{t('h')}</span>
                     </div>

                     <Button
                        className={cn("popup__btn")}
                        size={width > 380 ? "big" : "normal"}
                        onClick={() =>{
                           giveCoin()
                           buy(coinMoneyAnimRef, () =>
                              dispatch(closeCoinBuyPopup())
                           )
                        }
                        }>
                        <CoinWhiteBg
                           iconName="Bitcoin"
                           size={width > 380 ? "normall" : "small"}
                        />
                        <span>{coinState.info.price}</span>
                     </Button>
                     <img
                        // src={`img/pages/home/${mostExpensiveCoinName}/money.svg`}
                        src={`img/pages/home/money1.svg`}
                        className={cn("popup__money-anim")}
                        ref={coinMoneyAnimRef}
                     />
                  </div>
               </div>
            </Popup>

            {/* BOOST popup */}
            <PopupListWrap isOpen={boostPopupOpen}>
               <PopupListTabs
                  labels={["BOOST", "COINS", "LEAGUES"]}
                  activeTab={boostActiveTab}
                  onTabChange={(label) => setBoostActiveTab(label)}
               />
               {/* {boostActiveTab === "BOOST"  ? (
                  <PopupList ref={boostRef} nodes={renderBoosters()} />
               ) : (
                  <PopupList ref={boostRef} nodes={renderCoins()} />
               )} */}
               
               {boostActiveTab === "BOOST" && (
               <PopupList ref={boostRef} nodes={renderBoosters()} />
            )}
              {boostActiveTab === "COINS" && (
               <PopupList ref={boostRef} nodes={renderCoins()} />
            )}
                   {boostActiveTab === "LEAGUES" && (
               <PopupList
                  ref={earnRef}
                  nodes={renderLeagues()}
               />
            )}
              
            </PopupListWrap>


            {/* EARN popup */}
            <PopupListWrap isOpen={earnPopupOpen}>
               <PopupListTabs
                  labelClassName={cn("earn__label")}
                  labels={["TASKS"]}
                  activeTab={earnActiveTab}
                  onTabChange={(label) => setEarnActiveTab(label)}
               />
            {/* {earnActiveTab === "LEAGUES" && (
               <PopupList
                  ref={earnRef}
                  nodes={renderLeagues()}
               />
            )} */}
              
{earnActiveTab === "TASKS" && (
  <PopupList
    ref={earnRef}
    nodes={tasks.map(task => (
      <FreindOrSpecialBlock
        key={task.id}
        imgSrc={task.imgSrc}
        title={task.description}
        earning={task.rewardAmount.toString()}
        link={task.link}
        defaultButtonText={t('join')}
      />
    ))}
  />
)}

               {/* {earnActiveTab === "SPECIAL" && (
                  <PopupList
                     ref={earnRef}
                     nodes={[
                        <FreindOrSpecialBlock
                           imgSrc="img/social/tg.svg"
                           title="JOIN GROUP"
                           earning="20 000"
                           link="https://t.me/Simple_Tap_Bot"
                           defaultButtonText="GO OVER"
                        />,
                        <FreindOrSpecialBlock
                           imgSrc="img/social/tg.svg"
                           title="JOIN CHAT"
                           earning="20 000"
                           link="https://t.me/Simple_Tap_Bot"
                           defaultButtonText="GO OVER"

                        />,
                        <FreindOrSpecialBlock
                           imgSrc="img/social/X.svg"
                           title="JOIN X"
                           earning="20 000"
                           link="https://t.me/Simple_Tap_Bot"
                           defaultButtonText="GO OVER"

                        />,
                     ]}
                  />
               )} */}

               {/* {earnActiveTab === "FRIENDS TASKS" && (
                  <PopupList
                     ref={earnRef}
                     nodes={[
                        <FreindOrSpecialBlock
                           imgSrc="img/global/person-btn.svg"
                           title="1 friend"
                           earning="x1.5 harvest"
                           link=""
                           defaultButtonText="RECEIVE"
                           refs="1"
                        />,
                        <FreindOrSpecialBlock
                           imgSrc="img/global/person-btn.svg"
                           title="5 friends"
                           earning="x2 harvest"
                           link=""
                           defaultButtonText="RECEIVE"
                           refs="5"

                        />,
                        <FreindOrSpecialBlock
                           imgSrc="img/global/person-btn.svg"
                           title="25 friends"
                           earning="x3 harvest"
                           link=""
                           defaultButtonText="RECEIVE"
                           refs="25"

                        />,
                        <FreindOrSpecialBlock
                           imgSrc="img/global/person-btn.svg"
                           title="50 friends"
                           earning="x4 harvest"
                           link=""
                           defaultButtonText="RECEIVE"
                           refs="50"

                        />,
                        <FreindOrSpecialBlock
                           imgSrc="img/global/person-btn.svg"
                           title="100 friends"
                           earning="x5 harvest"
                           link=""
                           defaultButtonText="RECEIVE"
                           refs="100"

                        />,
                     ]}
                  />
               )} */}
            </PopupListWrap>

            {/* Иконка close, которая закрывает попапы с вариантом списка (<PopupListWrap />) */}
            {(boostPopupOpen || earnPopupOpen) && (
               <img
                  src="img/global/closeIcon.svg"
                  onClick={() => {
                     setBoostPopupOpen(false);
                     setEarnPopupOpen(false);
                  }}
                  className={cn("close")}
                  alt="Close"
               />
            )}
         </div>

         {/* Приветствие */}
         {!hasFirstReward && <Greeting />}
         {showGuide && <Guide />}
         <Guide1 />

         {/* Ежедневный бонус */}
         <DailyBonus />
      </>
          )}
      </>

   );
};

export default Home;