const { default: mongoose } = require("mongoose");

class whereCaluse{
    constructor(base, bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }
    search(){
        const searchword = this.bigQ.search ?
                            {
                                name: {
                                    $regex: this.bigQ.search,
                                    $options: 'i'
                                }
                            }: {}

        this.base = this.base.find({...searchword})
        return this;
    }

    categoryFilter(){
        console.log(this.bigQ);
        const categoryId = this.bigQ.categories ?
                            {
                                categories: {
                                    $all : this.bigQ.categories.split(',')
                                }
                            }: {}
        console.log({...categoryId});
        this.base = this.base.find({...categoryId})

        return this;
    }

    pager(resultPerPage){
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }

        const skipValue = resultPerPage*(currentPage-1);
        this.base = this.base.limit(resultPerPage).skip(skipValue)
        return this;
    }

    filter(){
        const copyQ = {...this.bigQ};
        delete copyQ['search']
        delete copyQ['limit']
        delete copyQ['page']

        if(copyQ['categories']){
            delete copyQ['categories']
        }
        else{
            copyQ['categories'] = copyQ['category']
            delete copyQ['category']
        }
    

        let stringOfCopyQ = JSON.stringify(copyQ)

        stringOfCopyQ = stringOfCopyQ.replace(
                        /\b(gte|lte|gt|lt)\b/g, 
                        m => `$${m}`);
            
        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);
        return this;    
    }

}

module.exports = whereCaluse;