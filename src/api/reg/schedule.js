import request from '@/utils/request'

const api_name = '/reg/schedule'


/*
获取后台排班分页列表(带搜索)
*/
export function getPageList(page, limit, searchObj) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params: searchObj
  })
}

/*
根据ID获取某个排班
*/
export function getById(id) {
  return request({
    url: `${api_name}/get/${id}`,
    method: 'get'
  })
}

/*
保存一个新的排班
*/
export function add(schedule) {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data: schedule
  })
}

/*
更新一个排班
*/
export function update(schedule) {
  return request({
    url: `${api_name}/update`,
    method: 'put',
    data: schedule
  })
}


/*
删除某个排班
*/
export function removeById(id) {
  return request({
    url: `${api_name}/remove/${id}`,
    method: 'delete'
  })
}

/*
批量删除多个排班
ids的结构: ids是包含n个id的数组
*/
export function removeschedules(ids) {
  return request({
    url: `${api_name}/batchRemove`,
    method: 'delete',
    data: ids
  })
}
