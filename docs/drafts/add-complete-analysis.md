We have implement the first version of the blog
The blog's goal is have a complete introduction about claude code's source code's harness engineering.
/Users/weirenlan/Desktop/self_project/labs/claude-code-src

我想要讓我的blog變得更專業/更完整/有料

/autoresearch skill來跑
    processing: please 搭配 /workflows:plan, /workflows:work 來交替使用
        - Help me to use puml(?PlantUML) or something better to draw the diagram, 假若原本的文中有重複，那請你評估看是否優化原本的
            1. Master query state machine: 讓我們能理解主query loop的主幹在做什麼
            2. Tool Execution state machine: 可以理解tool 的調用與中斷
            3. Compression and recovery strategy
            4. Agent lifecycle state machine and sdk conversation state machine
            5. 權限策略流程圖
        - 深化既有文章
        - 若覺得還有可以寫的面向你可以加入
    for every changes. use git to record
    evaluation:
        - 讓風格與品質能像是 lilian-weng等級的專案 https://lilianweng.github.io/posts/2025-05-01-thinking/
        - 假若目前的文還不夠深入，也請你用/workflows:plan 來研究如何更好，能像前openai成員lilian-weng等級，但也能像是andrej karpathy , 台大電機李宏毅老師在一開始平易近人，但又有深度。
        - 請你核實blog關於harness engineering 內容會跟 /Users/weirenlan/Desktop/self_project/labs/claude-code-src 對齊
        - if the quality is >95, stop the processing and git push to remote
            - 沒有AI味
            - 由淺入深
            - 乾貨
            - 確實的資料
