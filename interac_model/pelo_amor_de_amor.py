import numpy as np
import seaborn as sns
import math 
import random
import matplotlib.pyplot as plt

USERBASE = 26
RECENCYBOOST = .1
LOVEBOOST = .7
EPOCH_COINS = 3


class Bank:
    def __init__(self, pdic={}):
        self.treasury = 10**6
    
    def midnight(self, userbase):
        for u in userbase:
            if u.coins < 3:
                self.treasury += (u.coins - 3)
                u.coins = 3
        return userbase

class Human:
    def __init__(self, pdic={}):
        self.gender = pdic['gender']
        self.attractiveness = pdic['attractiveness'] or 0
        self.coins = pdic['coins']
        # self.standards = min(1, (pdic['attractiveness']+(1.5 - 3*random.random()))/10) or .5
        self.likedme = [] 
        self.pot = 0
        self.displayname = pdic['displayname']

    def _payout(self, cand):
        revenue = self.pot
        for liker in self.likedme[-3:]:
            if cand != liker:
                p = RECENCYBOOST * self.pot
                liker.coins += p
                revenue -= p
        self.coins += LOVEBOOST/2 * self.pot
        cand.coins += LOVEBOOST/2 * self.pot
        revenue -= LOVEBOOST * self.pot
        cand.pot, self.pot = 0, 0
        return revenue

    def _reclikefrom(self, sender):
        self.pot+=1
        self.likedme += [sender]


# Equation for swipe: if(standards < attractiveness), like
# Interaction is seer -> cand order
def interat(seer, cand):
    if (seer.attractiveness > random.random()):
        seer.coins-=1
        cand._reclikefrom(seer)
        print(f'It is a like :) from {seer.displayname} to {cand.displayname}')
        if(cand in set(seer.likedme)):
            print(f'It is a match! from {seer.displayname} to {cand.displayname}')
            return seer._payout(cand)
        return 0
    else:
        print(f'It is a dislike :( from {seer.displayname} to {cand.displayname}')
        return 0

def print_peeps(peeps):
    for i in peeps:
        print(f'NAME: {i.displayname}\nATTR: {i.attractiveness}\nCOINS: {i.coins}\nPOT: {i.pot}\n')
    print('*'*100)




if __name__ == '__main__':
    user_dic = {}
    names = list(map(chr, range(65, 123)))
    for g in ['M','F']:
        x = np.random.zipf(a=2, size=np.int(USERBASE/2))
        maxx = max(x)
        beatyiszipf = sorted([i/maxx for i in x])
        peeps = []
        for h in range(np.int(USERBASE/2)):
            pdic = {'gender':g,'attractiveness':beatyiszipf[h],'coins':EPOCH_COINS,'displayname':names.pop()}
            human = Human(pdic)
            peeps += [human]
        user_dic.update({g:peeps})
    # print_peeps(user_dic.get('F'))
    _REVENUE = 0
    INTERACTÕES = 1000
    for _ in range(INTERACTÕES):
        eme = random.sample(user_dic.get('M'), k=1)[0]
        efe = random.sample(user_dic.get('M'), k=1)[0]
        if (random.random() > .9):
            _REVENUE += interat(eme, efe)
        else:
            _REVENUE += interat(efe, eme)
    print(f'PROFIT {_REVENUE - USERBASE * EPOCH_COINS}\nPERCENT {_REVENUE * 100 / (USERBASE * EPOCH_COINS)}%')

    # pdic = {'gender':'F','attractiveness':1,'coins':EPOCH_COINS,'displayname':'A'}
    # a = Human(pdic)
    # pdic = {'gender':'F','attractiveness':1,'coins':EPOCH_COINS,'displayname':'B'}
    # b = Human(pdic)
    # pdic = {'gender':'F','attractiveness':1,'coins':EPOCH_COINS,'displayname':'C'}
    # c = Human(pdic)
    
    # print_peeps([a,b,c])
    # _REVENUE += interat(a,b)
    # print_peeps([a,b,c])
    # _REVENUE += interat(c,b)
    # print_peeps([a,b,c])
    # _REVENUE += interat(b,a)
    # print_peeps([a,b,c])
    # print(_REVENUE - 9)
    # bb = Bank()
    # print(bb.treasury)
    # print_peeps(bb.midnight([a,b]))
    # print(bb.treasury)
    # for i in user_dic.keys():
    #     print(i)
    #     print_peeps(user_dic.get(i))