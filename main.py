import os
from flask import Flask, request, render_template, send_from_directory, url_for
from sqlalchemy import create_engine, text

# 初始化Flask應用
app = Flask(__name__)

# 圖片資料夾
IMAGE_FOLDER = r'C:\Users\User\Desktop\main_project\city_image'

# 設定資料庫連線參數
DATABASE_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Aa900831',
    'database': 'city_databases'
}

# 初始化SQLAlchemy連接池: 優化應用程式的資料庫連線管理
engine = create_engine(
    f"mysql+pymysql://{DATABASE_CONFIG['user']}:{DATABASE_CONFIG['password']}@{DATABASE_CONFIG['host']}/{DATABASE_CONFIG['database']}",
    pool_size=10, max_overflow=20
)

# 獲取資料庫連線
def get_db_connection():
    try:
        return engine.connect()
    except Exception as e:
        print(f"無法連接到資料庫: {e}")
        return None

# 檢查並構建圖片的完整路徑
def get_city_images(city_name):
    img_path = os.path.join(IMAGE_FOLDER, f"{city_name}.jpg")
    print(f"正在檢查圖片: {img_path}")  
    if os.path.exists(img_path):  # 確認圖片存在
        return f"{city_name}.jpg"  # 返回文件名
    return None  # 如果圖片不存在，返回 None




# 篩選後景點
def get_attractions(category=None, continent=None, keyword=None, selected_month=None, temp_preference=None):
    conn = get_db_connection()
    if conn is None:
        return []

    try:
        # 準備基本的查詢語句，加入 citytemp_db 來取得溫度資訊
        query = '''
            SELECT DISTINCT citydb.city_id, citydb.city_name, citydb.country_name, citydb.city_name_cht, 
                   citydb.country_name_cht, citydb.attractions
        '''  # 去掉了 citytemp_db.average_temp，後面會根據條件決定是否添加

        query += '''
            FROM citydb
            LEFT JOIN cont_ap_db ON citydb.city_id = cont_ap_db.city_id
        '''
        
        # 如果有溫度偏好，加入 citytemp_db 表來篩選
        if temp_preference and '不限' not in temp_preference:
            query += ' LEFT JOIN citytemp_db ON citydb.city_id = citytemp_db.city_id'

        query += ' WHERE 1=1'

        params = {}

        # 景點分類篩選
        if category and len(category) > 0:
            query += ' AND (' + ' OR '.join([f"citydb.att_sorted LIKE :category_{i}" for i in range(len(category))]) + ')'
            for i, cat in enumerate(category):
                params[f'category_{i}'] = f"%{cat}%"

        # 大洲篩選
        if continent:
            query += ' AND cont_ap_db.continent IN :continent'
            params['continent'] = tuple(continent)

        # 關鍵字篩選
        if keyword:
            query += ' AND (citydb.attractions LIKE :keyword OR citydb.city_name LIKE :keyword OR citydb.country_name LIKE :keyword OR citydb.country_name_cht LIKE :keyword OR citydb.city_name_cht LIKE :keyword)'
            params['keyword'] = f"%{keyword}%"

        # 月份篩選
        if selected_month:
            query += ' AND citytemp_db.month = :selected_month'
            params['selected_month'] = selected_month

        # 溫度偏好篩選
        if temp_preference and '不限' not in temp_preference:
            temp_conditions = []
            if 'cold' in temp_preference:
                temp_conditions.append('citytemp_db.average_temp <= 5')
            if 'cool' in temp_preference:
                temp_conditions.append('citytemp_db.average_temp BETWEEN 6 AND 14')
            if 'moderate' in temp_preference:
                temp_conditions.append('citytemp_db.average_temp BETWEEN 15 AND 22')
            if 'warm' in temp_preference:
                temp_conditions.append('citytemp_db.average_temp BETWEEN 23 AND 30')
            if 'hot' in temp_preference:
                temp_conditions.append('citytemp_db.average_temp >= 31')

            # 拼接溫度條件
            if temp_conditions:
                query += ' AND (' + ' OR '.join(temp_conditions) + ')'

        # 去重並排序
        query += '''
            GROUP BY citydb.city_id, citydb.city_name, citydb.country_name, citydb.city_name_cht, 
                     citydb.country_name_cht, citydb.attractions
        '''
        query += ' ORDER BY citydb.city_name'

        # 執行查詢並獲取結果
        results = conn.execute(text(query), params).fetchall()

        attractions = []

        for city_id, city_name, country_name, city_name_cht, country_name_cht, attraction_list in results:
            print(f"城市ID: {city_id}, 城市名稱: {city_name}")
            images = get_city_images(city_name)
        
            attractions.append({
                'city_id': city_id,
                'city_name': city_name,
                'country_name': country_name,
                'city_name_cht': city_name_cht,
                'country_name_cht': country_name_cht,
                'attractions': attraction_list,
                'images': images
            })

        return attractions
    except Exception as e:
        print(f"資料庫錯誤: {e}")
        return []
    finally:
        conn.close()


# 獲取分類
def get_categories():
    conn = get_db_connection()
    try:
        query = 'SELECT DISTINCT att_sorted FROM citydb'
        results = conn.execute(text(query)).fetchall()
        categories = [row[0] for row in results]
        return categories
    except Exception as e:
        print(f"資料庫錯誤: {e}")
        return []
    finally:
        conn.close()

# 獲取大洲
def get_continents():
    conn = get_db_connection()
    if conn is None:
        return []

    try:
        query = 'SELECT DISTINCT continent FROM cont_ap_db'
        results = conn.execute(text(query)).fetchall()
        continents = [row[0] for row in results]
        return continents
    except Exception as e:
        print(f"資料庫錯誤: {e}")
        return []
    finally:
        conn.close()




# 圖片
@app.route('/images/<filename>')
def get_image(filename):
    full_path = os.path.join(IMAGE_FOLDER, filename)
    return send_from_directory(IMAGE_FOLDER, filename)

# index.html
@app.route('/', methods=['GET'])
def index():
    categories = get_categories()
    continents = get_continents()
    return render_template('index.html', categories=categories, continents=continents)

# result.html
@app.route('/result', methods=['GET', 'POST'])
def result():
    categories = get_categories()
    continents = get_continents()
    attractions = []
    error_message = None
    result_count = 0  # 查詢結果數量

    # 獲取index.html中用戶選擇的篩選條件
    selected_month = request.values.get('month')  # 月份
    category_list = request.form.get('selected_categories', '').split(',')  # 景點分類
    continent_list = request.values.getlist('continent')  # 大洲
    keyword = request.values.get('keyword')  # 關鍵字
    temp_preferences = request.values.getlist('temperature')  # 溫度偏好

    # 檢查月份是否存在並進行處理
    if selected_month:
        try:
            selected_month = int(selected_month)
            print(f"篩選的月份: {selected_month}")
        except ValueError:
            error_message = "無效的月份格式"
            return render_template('result.html', categories=categories, continents=continents,
                                   attractions=attractions, result_count=result_count,
                                   selected_month=None, selected_temperatures=temp_preferences,
                                   selected_categories=category_list, selected_continents=continent_list,
                                   keyword=keyword, error_message=error_message)

    # 調用 get_attractions 來篩選景點
    attractions = get_attractions(category_list, continent_list, keyword, selected_month, temp_preferences)
    result_count = len(attractions)

    # 渲染結果模板，並保留使用者的篩選條件
    return render_template('result.html', categories=categories, continents=continents,
                           attractions=attractions, result_count=result_count,
                           selected_month=selected_month,  # 渲染模板時返回月份
                           selected_temperatures=temp_preferences,
                           selected_categories=category_list, selected_continents=continent_list,
                           keyword=keyword, error_message=error_message)

# detail.html
@app.route('/detail/<city_name>', methods=['GET', 'POST'])
def detail(city_name):
    conn = get_db_connection()

    try:
        # 查詢城市詳細資料
        query = text('''
            SELECT citydb.city_name, citydb.country_name, citydb.city_name_cht, 
                   citydb.country_name_cht, citydb.attractions, cont_ap_db.airport_name
            FROM citydb
            LEFT JOIN cont_ap_db ON citydb.city_id = cont_ap_db.city_id
            WHERE citydb.city_name = :city_name
        ''')

        city_info = conn.execute(query, {'city_name': city_name}).fetchone()
        print(f"查詢結果: {city_info}")

        if city_info is None:
            return "未找到該城市的數據", 404

        # 選擇的月份
        selected_month = request.values.get('month')

        # 查找城市相關圖片的邏輯
        image_list = []
        for i in range(1, 6):  # 假設最多顯示5張圖片
            image_path = f'static/attractions_images/{city_name}_{i}.jpg'
            if os.path.exists(image_path):  # 檢查圖片是否存在
                image_list.append(f'{city_name}_{i}.jpg')

        # 渲染模板，傳遞城市詳細資訊和圖片列表
        return render_template('detail.html', city=city_info, selected_month=selected_month, image_list=image_list)
    
    except Exception as e:
        print(f"資料庫錯誤: {e}")
        return "城市詳細加載失敗", 500

    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
