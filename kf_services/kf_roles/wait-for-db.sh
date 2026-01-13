#!/bin/sh

# Biến để theo dõi trạng thái kết nối
# connected=false

# # Kiểm tra xem cơ sở dữ liệu đã sẵn sàng chưa
# until $connected; do
#   if nc -z -v -w10 kfm_mariadb 3306; then
#     connected=true
#     echo "Database is ready!"
#   else
#     echo "Waiting for database connection..."
#     # Đợi 1 giây trước khi kiểm tra lại
#     sleep 1
#   fi
# done

# # # Sau khi kết nối đã sẵn sàng, thực thi lệnh npm run dev
# if $connected; then
#   npm run dev
# fi


#!/bin/sh

Hàm để kiểm tra kết nối tới MariaDB
check_db_connection() {
  if nc -z -v -w10 kfm_mariadb 3306; then
    return 0  # Thành công
  else
    return 1  # Thất bại
  fi
}

# Vòng lặp vô hạn để theo dõi trạng thái của MariaDB và khởi động lại Node.js nếu cần
while true; do
  # Chờ cho đến khi kết nối cơ sở dữ liệu thành công
  until check_db_connection; do
    echo "Waiting for database connection..."
    sleep 1  # Đợi 1 giây trước khi kiểm tra lại
  done

  echo "Database is ready!"

  # Khởi động Node.js
  npm run dev &  # Chạy npm run dev trong nền
  npm_pid=$!     # Lưu PID của tiến trình npm

  # Theo dõi tiến trình npm và kiểm tra kết nối MariaDB
  while kill -0 "$npm_pid" 2>/dev/null; do
    if ! check_db_connection; then
      echo "Database connection lost! Stopping Node.js..."
      kill "$npm_pid"  # Dừng tiến trình npm
      wait "$npm_pid"  # Đợi tiến trình npm thực sự kết thúc
      break            # Thoát khỏi vòng lặp nội bộ và kiểm tra lại kết nối MariaDB
    fi
    sleep 1  # Đợi 1 giây trước khi kiểm tra lại
  done
done
